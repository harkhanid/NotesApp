package com.dharmikharkhani.notes.controller;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.CollaborationVerifyRequestDTO;
import com.dharmikharkhani.notes.dto.CollaborationVerifyResponseDTO;
import com.dharmikharkhani.notes.dto.NoteRequestDTO;
import com.dharmikharkhani.notes.dto.NoteResponseDTO;
import com.dharmikharkhani.notes.dto.ShareNoteRequestDTO;
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

    @GetMapping("/notes/{id}")
    public ResponseEntity<NoteResponseDTO> getNote(Authentication authentication, @PathVariable UUID id) {
        if (!authorizationService.isAllowedToEditNote(id)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        return ResponseEntity.ok(NoteResponseDTO.from(note));
    }

    @PostMapping("/notes")
    public ResponseEntity<NoteResponseDTO> createNote(Authentication authentication, @RequestBody NoteRequestDTO newNote) {
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

    /**
     * Update only the content of a note (optimized for collaboration saves)
     * Used by Hocuspocus server for database persistence
     */
    @PutMapping("/notes/{id}/content")
    public ResponseEntity<Void> updateNoteContent(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody String content) {
        if (!authorizationService.isAllowedToEditNote(id)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setContent(content);
        noteRepository.save(note);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(Authentication authentication, @PathVariable UUID id) {
        if(!authorizationService.isAllowedToDeleteNote(id)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notes/search")
    public ResponseEntity<List<NoteResponseDTO>> searchNotes(Authentication authentication, @RequestParam String keyword) {
        List<NoteResponseDTO> notes = noteService.searchNotes(authentication, keyword);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/notes/{id}/share")
    public ResponseEntity<NoteResponseDTO> shareNote(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody ShareNoteRequestDTO shareRequest) {
        String userEmail = authentication.getName();
        if(!authorizationService.isAllowedToDeleteNote(id)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        NoteResponseDTO note;
        try {
             note = noteService.shareNote(id, shareRequest.emails(), userEmail);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/notes/{id}/collaborators/{email}")
    public ResponseEntity<NoteResponseDTO> removeCollaborator(
            Authentication authentication,
            @PathVariable UUID id,
            @PathVariable String email) {
        String userEmail = authentication.getName();
        if(!authorizationService.isAllowedToDeleteNote(id)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        NoteResponseDTO note;
        try {
            note = noteService.removeCollaborator(id, email, userEmail);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.ok(note);
    }

    /**
     * Verify if a user is allowed to collaborate on a note
     * Used by Hocuspocus server for WebSocket authentication
     */
    @PostMapping("/notes/collaboration/verify")
    public ResponseEntity<CollaborationVerifyResponseDTO> verifyCollaborationAccess(
            Authentication authentication,
            @RequestBody CollaborationVerifyRequestDTO request) {

        String userEmail = authentication.getName();
        UUID noteId = request.noteId();

        // Check if user is allowed to edit the note
        boolean isAllowed = authorizationService.isAllowedToEditNote(noteId);

        // Get user information
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CollaborationVerifyResponseDTO response = new CollaborationVerifyResponseDTO(
                isAllowed,
                user.getEmail(),
                user.getUsername()
        );

        return ResponseEntity.ok(response);
    }
}