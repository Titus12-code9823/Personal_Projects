package com.example.musicapp_backend.controller;

import com.example.musicapp_backend.dto.ArtistDto;
import com.example.musicapp_backend.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/artists")
public class ArtistController {
    private final ArtistService service;
    public ArtistController(ArtistService service) { this.service = service; }

    @GetMapping public ResponseEntity<List<ArtistDto>> all() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping public ResponseEntity<ArtistDto> create(@RequestParam String name) {
        ArtistDto dto = service.create(name);
        return ResponseEntity.created(URI.create("/api/v1/artists/" + dto.id())).body(dto);
    }
}
