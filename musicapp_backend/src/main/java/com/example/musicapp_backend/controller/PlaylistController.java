package com.example.musicapp_backend.controller;

import com.example.musicapp_backend.dto.PlaylistCreateRequest;
import com.example.musicapp_backend.dto.PlaylistDto;
import com.example.musicapp_backend.service.PlaylistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;

@RestController
@RequestMapping("/playlists")
public class PlaylistController {
    private final PlaylistService service;
    public PlaylistController(PlaylistService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<PlaylistDto> create(@RequestBody PlaylistCreateRequest req) {
        if (req == null || req.name() == null || req.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required and cannot be blank.");
        }
        PlaylistDto dto = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/playlists/" + dto.id())).body(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping("/{id}/tracks/{trackId}")
    public ResponseEntity<PlaylistDto> addTrack(@PathVariable Long id, @PathVariable Long trackId) {
        return ResponseEntity.ok(service.addTrack(id, trackId));
    }

    @DeleteMapping("/{id}/tracks/{trackId}")
    public ResponseEntity<PlaylistDto> removeTrack(@PathVariable Long id, @PathVariable Long trackId) {
        return ResponseEntity.ok(service.removeTrack(id, trackId));
    }
}
