package com.dharmikharkhani.notes.dto;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.entity.Tag;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record NoteResponseDTO(
        UUID id,
        String title,
        String content,
        Set<String> tags
){
    public static NoteResponseDTO from(Note note){
        Set<String> tagNames = note.getTags().stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());
        Set<String> tags = note.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toSet());
        return new NoteResponseDTO(note.getId(), note.getTitle(), note.getContent(), tags);
    }
}
