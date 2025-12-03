package com.dharmikharkhani.notes.service;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.UserPreferencesDTO;
import com.dharmikharkhani.notes.entity.UserPreferences;
import com.dharmikharkhani.notes.repository.UserPreferencesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserPreferencesService {

    private final UserPreferencesRepository userPreferencesRepository;
    private final UserRepository userRepository;

    public UserPreferencesService(UserPreferencesRepository userPreferencesRepository, UserRepository userRepository) {
        this.userPreferencesRepository = userPreferencesRepository;
        this.userRepository = userRepository;
    }

    public UserPreferencesDTO getUserPreferences(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreferences preferences = userPreferencesRepository.findByUser(user)
                .orElseGet(() -> {
                    // Create default preferences if they don't exist
                    UserPreferences newPreferences = new UserPreferences(user, "Sans Serif", null);
                    return userPreferencesRepository.save(newPreferences);
                });

        return new UserPreferencesDTO(preferences.getFont(), preferences.getTheme());
    }

    @Transactional
    public UserPreferencesDTO updateUserPreferences(String userEmail, UserPreferencesDTO preferencesDTO) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreferences preferences = userPreferencesRepository.findByUser(user)
                .orElseGet(() -> new UserPreferences(user, "Sans Serif", null));

        // Update preferences
        if (preferencesDTO.font() != null) {
            preferences.setFont(preferencesDTO.font());
        }
        if (preferencesDTO.theme() != null) {
            preferences.setTheme(preferencesDTO.theme());
        }

        UserPreferences savedPreferences = userPreferencesRepository.save(preferences);
        return new UserPreferencesDTO(savedPreferences.getFont(), savedPreferences.getTheme());
    }
}
