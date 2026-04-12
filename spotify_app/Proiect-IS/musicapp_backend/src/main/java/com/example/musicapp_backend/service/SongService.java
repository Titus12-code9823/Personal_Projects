package com.example.musicapp_backend.service;

import com.example.musicapp_backend.dto.SongCreateRequest;
import com.example.musicapp_backend.dto.SongDto;
import com.example.musicapp_backend.exception.NotFoundException;
import com.example.musicapp_backend.model.Album;
import com.example.musicapp_backend.model.Artist;
import com.example.musicapp_backend.model.Song;
import com.example.musicapp_backend.repository.AlbumRepository;
import com.example.musicapp_backend.repository.ArtistRepository;
import com.example.musicapp_backend.repository.SongRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SongService {

    private final SongRepository songRepo;
    private final ArtistRepository artistRepo;
    private final AlbumRepository albumRepo;

    public SongService(SongRepository songRepo, ArtistRepository artistRepo, AlbumRepository albumRepo) {
        this.songRepo = songRepo;
        this.artistRepo = artistRepo;
        this.albumRepo = albumRepo;
    }

    // -------------------- READ --------------------

    public List<SongDto> all() {
        List<Song> songs = songRepo.findAll();
        System.out.println("=== Fetching all songs ===");
        for (Song song : songs) {
            System.out.println("Song ID: " + song.getId() + ", Title: " + song.getTitle() + ", s3Key: " + (song.getS3Key() != null ? song.getS3Key() : "NULL"));
        }
        List<SongDto> dtos = songs.stream()
                .map(this::toDto)
                .toList();
        System.out.println("=== Returning DTOs ===");
        for (SongDto dto : dtos) {
            System.out.println("DTO Song ID: " + dto.id() + ", Title: " + dto.title() + ", s3Key: " + (dto.s3Key() != null ? dto.s3Key() : "NULL"));
        }
        return dtos;
    }

    public SongDto get(Long id) {
        Song song = songRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Song not found: " + id));
        return toDto(song);
    }

    public List<SongDto> searchByTitle(String q) {
        return songRepo.findByTitleContainingIgnoreCase(q)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<SongDto> searchByArtist(String name) {
        return songRepo.findByArtists_NameIgnoreCase(name)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // -------------------- WRITE --------------------

    public SongDto create(SongCreateRequest req) {
        validate(req);

        // Find album
        Album album = albumRepo.findById(req.albumId())
                .orElseThrow(() -> new NotFoundException("Album not found: " + req.albumId()));

        // Find artists
        Set<Artist> artists = new HashSet<>(artistRepo.findAllById(req.artistIds()));
        if (artists.isEmpty()) {
            throw new IllegalArgumentException("At least one valid artist is required.");
        }

        Song song = new Song();
        song.setTitle(req.title());
        song.setDuration(req.duration());
        song.setS3Key(req.s3Key());
        song.setAlbum(album);
        song.setArtists(artists);

        System.out.println("Creating song with s3Key: " + (req.s3Key() != null ? req.s3Key() : "NULL"));
        
        Song saved = songRepo.save(song);
        
        System.out.println("Saved song ID: " + saved.getId() + ", s3Key: " + (saved.getS3Key() != null ? saved.getS3Key() : "NULL"));
        
        SongDto dto = toDto(saved);
        System.out.println("Returning DTO with s3Key: " + (dto.s3Key() != null ? dto.s3Key() : "NULL"));
        
        return dto;
    }

    public SongDto update(Long id, SongCreateRequest req) {
        validate(req);

        Song song = songRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Song not found: " + id));

        Album album = albumRepo.findById(req.albumId())
                .orElseThrow(() -> new NotFoundException("Album not found: " + req.albumId()));

        Set<Artist> artists = new HashSet<>(artistRepo.findAllById(req.artistIds()));
        if (artists.isEmpty()) {
            throw new IllegalArgumentException("At least one valid artist is required.");
        }

        song.setTitle(req.title());
        song.setDuration(req.duration());
        song.setS3Key(req.s3Key());
        song.setAlbum(album);
        song.setArtists(artists);

        Song updated = songRepo.save(song);
        return toDto(updated);
    }

    public void delete(Long id) {
        Song song = songRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Song not found: " + id));
        songRepo.delete(song);
    }

    // -------------------- VALIDATION --------------------

    private void validate(SongCreateRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request body is required.");
        }
        if (req.title() == null || req.title().isBlank()) {
            throw new IllegalArgumentException("title is required and cannot be blank.");
        }
        if (req.duration() == null || req.duration() < 1) {
            throw new IllegalArgumentException("duration must be >= 1 second.");
        }
        if (req.albumId() == null) {
            throw new IllegalArgumentException("albumId is required.");
        }
        if (req.artistIds() == null || req.artistIds().isEmpty()) {
            throw new IllegalArgumentException("artistIds must not be empty.");
        }
    }

    // -------------------- MAPPING --------------------

    private SongDto toDto(Song song) {
        return new SongDto(
                song.getId(),
                song.getTitle(),
                song.getDuration(),
                song.getS3Key(),
                song.getAlbum() != null ? song.getAlbum().getId() : null,
                song.getAlbum() != null ? song.getAlbum().getTitle() : null,
                song.getArtists().stream().map(Artist::getId).toList(),
                song.getArtists().stream().map(Artist::getName).toList()
        );
    }
}
