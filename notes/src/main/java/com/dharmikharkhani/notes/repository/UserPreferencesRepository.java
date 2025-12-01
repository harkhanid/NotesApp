package com.dharmikharkhani.notes.repository;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
    Optional<UserPreferences> findByUser(User user);
}
