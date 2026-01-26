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
import com.dharmikharkhani.notes.service.HybridSearchService;
import com.dharmikharkhani.notes.service.NoteService;
import com.dharmikharkhani.notes.service.PGVectorSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class NoteController {

    private final NoteRepository noteRepository;

    private final UserRepository userRepository;
    private final NoteService noteService;
    private final AuthorizationService authorizationService;
    private final HybridSearchService hybridSearchService;
    private final PGVectorSearchService pgVectorSearchService;

    public NoteController(NoteRepository noteRepository, UserRepository userRepository, NoteService noteService, AuthorizationService authorizationService, HybridSearchService hybridSearchService, PGVectorSearchService pgVectorSearchService) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.noteService = noteService;
        this.authorizationService = authorizationService;
        this.hybridSearchService = hybridSearchService;
        this.pgVectorSearchService = pgVectorSearchService;
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

        noteService.updateNoteContent(id, content);
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
    public ResponseEntity<List<NoteResponseDTO>> searchNotes(
            Authentication authentication,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "hybrid") String mode) {

        List<NoteResponseDTO> notes;
        try {
            if ("keyword".equals(mode)) {
                // Use keyword-only search
                notes = noteService.searchNotes(authentication, keyword);
            } else {
                // Use hybrid search (default)
                notes = hybridSearchService.hybridSearch(authentication, keyword);
            }
        } catch (Exception e) {
            // Fallback to keyword search if hybrid search fails
            notes = hybridSearchService.keywordSearchFallback(authentication, keyword);
        }

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

    /**
     * Regenerate embedding for a specific note
     * User must own the note or have edit access
     */
    @PostMapping("/notes/{id}/embeddings/regenerate")
    public ResponseEntity<Map<String, Object>> regenerateNoteEmbedding(
            Authentication authentication,
            @PathVariable UUID id) {

        // Check authorization
        if (!authorizationService.isAllowedToEditNote(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You don't have permission to edit this note"));
        }

        try {
            // Get the note
            Note note = noteRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Note not found"));

            // Regenerate embedding
            pgVectorSearchService.upsertNoteEmbedding(note.getId(), note.getTitle(), note.getContent());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Embedding regenerated successfully");
            response.put("noteId", id.toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to regenerate embedding: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Regenerate embeddings for all notes owned by the user
     */
    @PostMapping("/notes/embeddings/regenerate-all")
    public ResponseEntity<Map<String, Object>> regenerateAllUserEmbeddings(Authentication authentication) {

        try {
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get all notes owned by or shared with the user
            List<Note> userNotes = noteRepository.findByOwnerOrSharedWith(user);

            int totalNotes = userNotes.size();
            int successCount = 0;
            int failureCount = 0;

            for (Note note : userNotes) {
                try {
                    // Only regenerate for notes the user owns (not shared notes)
                    if (note.getOwner().getId().equals(user.getId())) {
                        pgVectorSearchService.upsertNoteEmbedding(
                                note.getId(),
                                note.getTitle(),
                                note.getContent()
                        );
                        successCount++;
                    }
                } catch (Exception e) {
                    failureCount++;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Embedding regeneration completed");
            response.put("totalNotes", totalNotes);
            response.put("processedNotes", successCount);
            response.put("successCount", successCount);
            response.put("failureCount", failureCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to regenerate embeddings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Check if a note has an embedding
     */
    @GetMapping("/notes/{id}/embeddings/status")
    public ResponseEntity<Map<String, Object>> checkEmbeddingStatus(
            Authentication authentication,
            @PathVariable UUID id) {

        // Check authorization
        if (!authorizationService.isAllowedToEditNote(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You don't have permission to view this note"));
        }

        try {
            // Check if note exists
            boolean noteExists = noteRepository.existsById(id);
            if (!noteExists) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "error", "Note not found"));
            }

            // Check if embedding exists
            boolean hasEmbedding = pgVectorSearchService.hasEmbedding(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("noteId", id.toString());
            response.put("hasEmbedding", hasEmbedding);
            response.put("message", hasEmbedding ? "Note has an embedding" : "Note does not have an embedding");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to check embedding status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}