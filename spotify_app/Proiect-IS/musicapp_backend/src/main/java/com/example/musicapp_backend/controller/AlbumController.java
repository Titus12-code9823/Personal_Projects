package com.example.musicapp_backend.controller;

import com.example.musicapp_backend.dto.AlbumCreateRequest;
import com.example.musicapp_backend.dto.AlbumDto;
import com.example.musicapp_backend.service.AlbumService;
import com.example.musicapp_backend.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/albums")
public class AlbumController {

    private final AlbumService service;
    private final StorageService storageService;

    public AlbumController(AlbumService service, StorageService storageService) {
        this.service = service;
        this.storageService = storageService;
    }

    /** Get all albums */
    @GetMapping
    public ResponseEntity<List<AlbumDto>> all() {
        return ResponseEntity.ok(service.all());
    }

    /** Get one album by ID */
    @GetMapping("/{id}")
    public ResponseEntity<AlbumDto> one(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    /** * Finalize Album Creation.
     * Use this after uploading the cover art to S3 via MediaController.
     */
    @PostMapping("/finalize")
    public ResponseEntity<AlbumDto> finalizeUpload(@RequestBody AlbumCreateRequest req) {
        validate(req);

        // Ensure cover art exists in S3 if a key is provided
        if (req.coverArtS3Key() != null && !req.coverArtS3Key().isBlank()) {
            if (!storageService.exists(req.coverArtS3Key())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "S3 object not found for cover art.");
            }
        }

        AlbumDto dto = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/albums/" + dto.id())).body(dto);
    }

    /** Update an album */
    @PutMapping("/{id}")
    public ResponseEntity<AlbumDto> update(@PathVariable Long id, @RequestBody AlbumCreateRequest req) {
        validate(req);
        return ResponseEntity.ok(service.update(id, req));
    }

    /** Delete an album */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void validate(AlbumCreateRequest req) {
        if (req == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body required.");
        if (req.title() == null || req.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title required.");
        }
        // Add other validation logic (e.g., releaseDate)
    }
}