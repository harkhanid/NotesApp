package com.dharmikharkhani.notes.dto;
import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.entity.Tag;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record NoteResponseDTO(
        UUID id,
        String title,
        String content,
        Set<String> tags,
        boolean isShared,
        Set<CollaboratorDTO> sharedWith,
        Long ownerId,
        LocalDateTime createdAt
){
    public static NoteResponseDTO from(Note note){
        Set<String> tags = note.getTags().stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());

        Set<CollaboratorDTO> collaborators = note.getSharedWith().stream()
                .map(CollaboratorDTO::from)
                .collect(Collectors.toSet());

        boolean isShared = !note.getSharedWith().isEmpty();

        return new NoteResponseDTO(
                note.getId(),
                note.getTitle(),
                note.getContent(),
                tags,
                isShared,
                collaborators,
                note.getOwner().getId(),
                note.getCreatedAt()
        );
    }
}
