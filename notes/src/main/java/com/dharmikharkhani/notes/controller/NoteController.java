package com.dharmikharkhani.notes.controller;

import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.NoteRequestDTO;
import com.dharmikharkhani.notes.dto.NoteResponseDTO;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.repository.NoteRepository;
import com.dharmikharkhani.notes.service.AuthorizationService;
import com.dharmikharkhani.notes.service.NoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class NoteController {

    private final NoteRepository noteRepository;

    private final UserRepository userRepository;
    private final NoteService noteService;
    private final AuthorizationService authorizationService;

    public NoteController(NoteRepository noteRepository, UserRepository userRepository, NoteService noteService, AuthorizationService authorizationService) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.noteService = noteService;
        this.authorizationService = authorizationService;
    }

    @GetMapping("/notes")
    public ResponseEntity<List<NoteResponseDTO>> getUserNotes(Authentication authentication) {
        List<NoteResponseDTO> notes = noteService.getNoteList(authentication);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/notes")
    public ResponseEntity<NoteResponseDTO> createNote(Authentication authentication, @RequestBody Note newNote) {
        String userEmail = authentication.getName();
        Note savedNote = noteService.createNote(newNote, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(NoteResponseDTO.from(savedNote));
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<NoteResponseDTO> updateNote(Authentication authentication, @PathVariable UUID id, @RequestBody NoteRequestDTO updatedNote) {
        String userEmail = authentication.getName();
        if(!authorizationService.isAllowedToEditNote(id)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        NoteResponseDTO savedNote = noteService.updateNote(id, updatedNote, userEmail);
        return ResponseEntity.ok(savedNote);
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(Authentication authentication, @PathVariable UUID id) {
        if(!authorizationService.isAllowedToDeleteNote(id)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}