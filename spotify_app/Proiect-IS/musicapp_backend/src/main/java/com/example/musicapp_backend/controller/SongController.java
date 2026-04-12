package com.example.musicapp_backend.controller;

import com.example.musicapp_backend.dto.SongCreateRequest;
import com.example.musicapp_backend.dto.SongDto;
import com.example.musicapp_backend.service.SongService;
import com.example.musicapp_backend.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/songs")
public class SongController {

    private final SongService service;
    private final StorageService storageService;

    public SongController(SongService service, StorageService storageService) {
        this.service = service;
        this.storageService = storageService;
    }

    // -------------------- READ --------------------

    /** Get all songs */
    @GetMapping
    public ResponseEntity<List<SongDto>> all() {
        return ResponseEntity.ok(service.all());
    }

    /** Get one song by ID */
    @GetMapping("/{id}")
    public ResponseEntity<SongDto> one(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    /** Search songs by title or artist name */
    @GetMapping("/search")
    public ResponseEntity<List<SongDto>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist
    ) {
        if (title != null && !title.isBlank()) {
            return ResponseEntity.ok(service.searchByTitle(title));
        }
        if (artist != null && !artist.isBlank()) {
            return ResponseEntity.ok(service.searchByArtist(artist));
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide 'title' or 'artist' query param.");
    }

    // -------------------- PLAYBACK --------------------

    public record PlayResponse(String playUrl) {}

    @GetMapping("/{id}/play")
    public ResponseEntity<PlayResponse> play(@PathVariable Long id) {
        // 1. Get the song metadata from DB to find the S3 Key
        SongDto song = service.get(id);

        // 2. Check if song has an audio file
        if (song.s3Key() == null || song.s3Key().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Song does not have an audio file. s3Key is missing.");
        }

        // 3. Generate a temporary link (valid for e.g., 10 minutes)
        String presignedUrl = storageService.createPresignedDownloadUrl(
                song.s3Key(),
                java.time.Duration.ofMinutes(10)
        );

        return ResponseEntity.ok(new PlayResponse(presignedUrl));
    }

    // -------------------- WRITE --------------------

    /** Create a new song */
    @PostMapping
    public ResponseEntity<SongDto> create(@RequestBody SongCreateRequest req) {
        validate(req);
        SongDto dto = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/songs/" + dto.id())).body(dto);
    }

    //-------------------- 1.UPLOAD PREP -------------------
    // is handled in MediaController via createUploadUrl
    // PostMapping to "/upload-url"
    // the JSON response from that contains "s3Key" and "uploadUrl"

    //------------------2. UPLOAD TO S3---------------------
    // the frontend uploads to the "uploadUrl" from step 1

    //-------------------- 3.FINALIZE UPLOAD --------------
    /** Finalize upload: verify S3 key exists, then create */
    @PostMapping("/finalize")
    public ResponseEntity<SongDto> finalizeUpload(@RequestBody SongCreateRequest req) {
        validate(req);
        if (req.s3Key() == null || req.s3Key().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "s3Key is required for finalize.");
        }
        
        // Retry logic for S3 eventual consistency (wait up to 3 seconds)
        boolean exists = false;
        int maxRetries = 6;
        int retryDelayMs = 500;
        for (int i = 0; i < maxRetries; i++) {
            try {
                exists = storageService.exists(req.s3Key());
                if (exists) {
                    break;
                }
            } catch (Exception e) {
                // If it's the last retry, throw the exception
                if (i == maxRetries - 1) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Failed to verify S3 object: " + e.getMessage());
                }
            }
            if (!exists && i < maxRetries - 1) {
                try {
                    Thread.sleep(retryDelayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Interrupted while checking S3");
                }
            }
        }
        
        if (!exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "S3 object not found for provided s3Key: " + req.s3Key() + ". The file may not have been uploaded successfully.");
        }
        
        SongDto dto = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/songs/" + dto.id())).body(dto);
    }

    /** Update an existing song */
    @PutMapping("/{id}")
    public ResponseEntity<SongDto> update(@PathVariable Long id, @RequestBody SongCreateRequest req) {
        validate(req);
        return ResponseEntity.ok(service.update(id, req));
    }

    /** Delete a song */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------- VALIDATION --------------------

    private void validate(SongCreateRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required.");
        }
        if (req.title() == null || req.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required and cannot be blank.");
        }
        if (req.duration() == null || req.duration() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration must be >= 1 second.");
        }
        if (req.albumId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Album ID is required.");
        }
        if (req.artistIds() == null || req.artistIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one artist ID is required.");
        }
    }
}
