package com.dharmikharkhani.notes.controller;

import com.dharmikharkhani.notes.dto.UserPreferencesDTO;
import com.dharmikharkhani.notes.service.UserPreferencesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/preferences")
public class UserPreferencesController {

    private final UserPreferencesService userPreferencesService;

    public UserPreferencesController(UserPreferencesService userPreferencesService) {
        this.userPreferencesService = userPreferencesService;
    }

    @GetMapping
    public ResponseEntity<UserPreferencesDTO> getPreferences(Authentication authentication) {
        String userEmail = authentication.getName();
        UserPreferencesDTO preferences = userPreferencesService.getUserPreferences(userEmail);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping
    public ResponseEntity<UserPreferencesDTO> updatePreferences(
            Authentication authentication,
            @RequestBody UserPreferencesDTO preferencesDTO) {
        String userEmail = authentication.getName();
        UserPreferencesDTO updatedPreferences = userPreferencesService.updateUserPreferences(userEmail, preferencesDTO);
        return ResponseEntity.ok(updatedPreferences);
    }
}
