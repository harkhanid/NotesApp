package com.dharmikharkhani.notes.dto;

import java.util.Set;

public record ShareNoteRequestDTO(
        Set<String> emails
) {
}
