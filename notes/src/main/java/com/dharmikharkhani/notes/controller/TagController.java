package com.dharmikharkhani.notes.controller;

import com.dharmikharkhani.notes.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public ResponseEntity<List<String>> getTags(Authentication authentication) {
        String userEmail = authentication.getName();
        List<String> tags = tagService.getTagsForUser(userEmail);
        return ResponseEntity.ok(tags);
    }
}
