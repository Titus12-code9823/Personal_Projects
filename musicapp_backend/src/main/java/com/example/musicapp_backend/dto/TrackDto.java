package com.example.musicapp_backend.dto;

public record TrackDto(Long id, String title, Integer durationSec, Long artistId, String artistName) {}
