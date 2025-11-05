package com.dharmikharkhani.notes.dto;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record NoteRequestDTO(
        @NotBlank(message = "Title Can not be blank")
        String title,
        String content,
        Set<String> tags
){

}
