package com.example.musicapp_backend.controller;

import com.example.musicapp_backend.dto.TrackCreateRequest;
import com.example.musicapp_backend.dto.TrackDto;
import com.example.musicapp_backend.service.TrackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tracks")
public class TrackController {
    private final TrackService service;

    public TrackController(TrackService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<TrackDto>> all() {
        return ResponseEntity.ok(service.all());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrackDto> one(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TrackDto>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist
    ) {
        if (title != null) return ResponseEntity.ok(service.searchByTitle(title));
        if (artist != null) return ResponseEntity.ok(service.searchByArtist(artist));
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide 'title' or 'artist' query param.");
    }

    @PostMapping
    public ResponseEntity<TrackDto> create(@RequestBody TrackCreateRequest req) {
        validate(req);
        TrackDto dto = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/tracks/" + dto.id())).body(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackDto> update(@PathVariable Long id, @RequestBody TrackCreateRequest req) {
        validate(req);
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void validate(TrackCreateRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body is required.");
        }
        if (req.title() == null || req.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required and cannot be blank.");
        }
        if (req.durationSec() == null || req.durationSec() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationSec must be >= 1.");
        }
        if (req.artistId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "artistId is required.");
        }
    }
}
