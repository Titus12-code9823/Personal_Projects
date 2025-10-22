package com.example.musicapp_backend.repository;

import com.example.musicapp_backend.model.Track;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackRepository extends JpaRepository<Track, Long> {

    List<Track> findByTitleContainingIgnoreCase(String q);
    List<Track> findByArtist_NameIgnoreCase(String artistName);
}
