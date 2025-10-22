package com.example.musicapp_backend.dto;

public record TrackCreateRequest(
        String title,
        Integer durationSec,
        Long artistId
) {}
