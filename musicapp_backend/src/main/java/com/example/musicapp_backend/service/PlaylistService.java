package com.example.musicapp_backend.service;

import com.example.musicapp_backend.dto.PlaylistCreateRequest;
import com.example.musicapp_backend.dto.PlaylistDto;
import com.example.musicapp_backend.exception.NotFoundException;
import com.example.musicapp_backend.model.Playlist;
import com.example.musicapp_backend.model.Track;
import com.example.musicapp_backend.repository.PlaylistRepository;
import com.example.musicapp_backend.repository.TrackRepository;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    private final PlaylistRepository repo;
    private final TrackRepository trackRepo;

    public PlaylistService(PlaylistRepository repo, TrackRepository trackRepo) {
        this.repo = repo;
        this.trackRepo = trackRepo;
    }

    public PlaylistDto create(PlaylistCreateRequest req) {
        if (req == null || req.name() == null || req.name().isBlank()) {
            throw new IllegalArgumentException("name is required and cannot be blank.");
        }
        Playlist p = repo.save(new Playlist(req.name()));
        return toDto(p);
    }

    public PlaylistDto get(Long id) {
        Playlist p = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Playlist not found: " + id));
        return toDto(p);
    }

    public PlaylistDto addTrack(Long playlistId, Long trackId) {
        Playlist p = repo.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("Playlist not found: " + playlistId));
        Track t = trackRepo.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found: " + trackId));

        p.getTracks().add(t);
        return toDto(repo.save(p));
    }

    public PlaylistDto removeTrack(Long playlistId, Long trackId) {
        Playlist p = repo.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("Playlist not found: " + playlistId));
        Track t = trackRepo.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found: " + trackId));

        p.getTracks().remove(t);
        return toDto(repo.save(p));
    }

    private PlaylistDto toDto(Playlist p) {
        Set<Long> ids = p.getTracks().stream()
                .map(Track::getId)
                .collect(Collectors.toSet());
        return new PlaylistDto(p.getId(), p.getName(), ids);
    }
}
 