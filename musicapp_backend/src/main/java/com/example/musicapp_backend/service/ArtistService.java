package com.example.musicapp_backend.service;

import com.example.musicapp_backend.dto.ArtistDto;
import com.example.musicapp_backend.exception.NotFoundException;
import com.example.musicapp_backend.model.Artist;
import com.example.musicapp_backend.repository.ArtistRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArtistService {
    private final ArtistRepository repo;
    public ArtistService(ArtistRepository repo) { this.repo = repo; }

    public Artist getEntity(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Artist not found: " + id));
    }

    public List<ArtistDto> findAll() {
        return repo.findAll().stream().map(a -> new ArtistDto(a.getId(), a.getName())).toList();
    }

    public ArtistDto create(String name) {
        Artist a = repo.findByNameIgnoreCase(name).orElseGet(() -> repo.save(new Artist(name)));
        return new ArtistDto(a.getId(), a.getName());
    }
}
