package com.example.musicapp_backend.service;

import com.example.musicapp_backend.dto.TrackCreateRequest;
import com.example.musicapp_backend.dto.TrackDto;
import com.example.musicapp_backend.exception.NotFoundException;
import com.example.musicapp_backend.model.Artist;
import com.example.musicapp_backend.model.Track;
import com.example.musicapp_backend.repository.ArtistRepository;
import com.example.musicapp_backend.repository.TrackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrackService {

    private final TrackRepository trackRepo;
    private final ArtistRepository artistRepo;

    public TrackService(TrackRepository trackRepo, ArtistRepository artistRepo) {
        this.trackRepo = trackRepo;
        this.artistRepo = artistRepo;
    }

    //partea de read

    public List<TrackDto> all() {
        return trackRepo.findAll().stream().map(this::toDto).toList();
    }

    public TrackDto get(Long id) {
        Track t = trackRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Track not found: " + id));
        return toDto(t);
    }

    public List<TrackDto> searchByTitle(String q) {
        return trackRepo.findByTitleContainingIgnoreCase(q)
                .stream().map(this::toDto).toList();
    }

    public List<TrackDto> searchByArtist(String name) {
        return trackRepo.findByArtist_NameIgnoreCase(name)
                .stream().map(this::toDto).toList();
    }

    //partea de write

    public TrackDto create(TrackCreateRequest req) {
        validate(req);
        Artist artist = artistRepo.findById(req.artistId())
                .orElseThrow(() -> new NotFoundException("Artist not found: " + req.artistId()));
        Track t = new Track(req.title(), req.durationSec(), artist);
        return toDto(trackRepo.save(t));
    }

    public TrackDto update(Long id, TrackCreateRequest req) {
        validate(req);
        Track t = trackRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Track not found: " + id));
        Artist artist = artistRepo.findById(req.artistId())
                .orElseThrow(() -> new NotFoundException("Artist not found: " + req.artistId()));

        t.setTitle(req.title());
        t.setDurationSec(req.durationSec());
        t.setArtist(artist);

        return toDto(trackRepo.save(t));
    }

    public void delete(Long id) {
        Track t = trackRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Track not found: " + id));
        trackRepo.delete(t);
    }

    //erori sau validari

    private void validate(TrackCreateRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Body is required.");
        }
        if (req.title() == null || req.title().isBlank()) {
            throw new IllegalArgumentException("title is required and cannot be blank.");
        }
        if (req.durationSec() == null || req.durationSec() < 1) {
            throw new IllegalArgumentException("durationSec must be >= 1.");
        }
        if (req.artistId() == null) {
            throw new IllegalArgumentException("artistId is required.");
        }
    }

    private TrackDto toDto(Track t) {
        return new TrackDto(
                t.getId(),
                t.getTitle(),
                t.getDurationSec(),
                t.getArtist() != null ? t.getArtist().getId() : null,
                t.getArtist() != null ? t.getArtist().getName() : null
        );
    }
}
