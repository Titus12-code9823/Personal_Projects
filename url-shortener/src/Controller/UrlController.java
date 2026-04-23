
package org.example.urlshortener.controller;

import org.example.urlshortener.model.Url;
import org.example.urlshortener.service.UrlService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
public class UrlController {

    private final UrlService service;

    public UrlController(UrlService service) {
        this.service = service;
    }

    @PostMapping("/shorten")
    public Url shorten(@RequestBody Url request) {
        return service.createShortUrl(request.getOriginalUrl());
    }

    @GetMapping("/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {
        Url url = service.getByCode(code);

        return ResponseEntity
                .status(302)
                .header(HttpHeaders.LOCATION, url.getOriginalUrl())
                .build();
    }
}