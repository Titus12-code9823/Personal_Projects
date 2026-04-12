package com.example.musicapp_backend.dto;

import java.util.List;

public record SongDto(
        Long id,
        String title,
        Integer duration,
        String s3Key,
        Long albumId,
        String albumTitle,
        List<Long> artistIds,
        List<String> artistNames
) {}