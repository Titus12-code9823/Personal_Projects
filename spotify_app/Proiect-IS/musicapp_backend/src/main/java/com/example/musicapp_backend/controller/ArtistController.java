package com.example.musicapp_backend.controller;

import com.example.musicapp_backend.dto.ArtistCreateRequest;
import com.example.musicapp_backend.dto.ArtistDto;
import com.example.musicapp_backend.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
// FIX: Match the prefix used in SongController and MediaController
@RequestMapping("/api/v1/artists")
public class ArtistController {

    private final ArtistService service;

    public ArtistController(ArtistService service) {
        this.service = service;
    }


    @GetMapping
    public ResponseEntity<List<ArtistDto>> all() {
        return ResponseEntity.ok(service.all());
    }

    // ADDED: Needed for "Artist Profile" pages
    @GetMapping("/{id}")
    public ResponseEntity<ArtistDto> one(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }


    @PostMapping
    public ResponseEntity<ArtistDto> create(@RequestBody ArtistCreateRequest req) {
        // You might want to add basic validation here (e.g. if name is blank)
        // if (req.name() == null || req.name().isBlank()) throw ...

        ArtistDto dto = service.create(req);

        // FIX: Update URI to match the controller path
        return ResponseEntity.created(URI.create("/api/v1/artists/" + dto.id())).body(dto);
    }
}
