package org.example.urlshortener.service;

import org.example.urlshortener.model.Url;
import org.example.urlshortener.repository.UrlRepository;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class UrlService {

    private final UrlRepository repo;
    private final String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final Random random = new Random();

    public UrlService(UrlRepository repo) {
        this.repo = repo;
    }

    public Url createShortUrl(String originalUrl) {
        String code = generateCode();

        Url url = new Url(originalUrl, code);
        return repo.save(url);
    }

    public Url getByCode(String code) {
        Url url = repo.findByShortCode(code).orElseThrow();

        url.setClicks(url.getClicks() + 1);
        repo.save(url);

        return url;
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}