package com.dharmikharkhani.notes.dto;

import com.dharmikharkhani.notes.auth.model.User;

public record CollaboratorDTO(
        Long id,
        String email,
        String name
) {
    public static CollaboratorDTO from(User user) {
        return new CollaboratorDTO(
                user.getId(),
                user.getEmail(),
                user.getName()
        );
    }
}
