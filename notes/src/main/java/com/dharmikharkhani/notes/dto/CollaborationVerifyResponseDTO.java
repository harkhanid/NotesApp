package com.dharmikharkhani.notes.dto;

public record CollaborationVerifyResponseDTO(
    boolean allowed,
    String email,
    String username
) {}
