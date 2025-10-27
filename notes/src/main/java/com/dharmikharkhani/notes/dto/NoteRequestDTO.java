package com.dharmikharkhani.notes.dto;
import jakarta.validation.constraints.NotBlank;

public record NoteRequestDTO(
        @NotBlank(message = "Title Can not be blank")
        String title,
        String content
){

}
