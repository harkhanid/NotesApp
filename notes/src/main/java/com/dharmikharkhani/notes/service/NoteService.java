package com.dharmikharkhani.notes.service;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.NoteRequestDTO;
import com.dharmikharkhani.notes.dto.NoteResponseDTO;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.exception.ResourceNotFoundException;
import com.dharmikharkhani.notes.repository.NoteRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class NoteService {
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;

    public NoteService(UserRepository userRepository, NoteRepository noteRepository) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
    }


    @Transactional
    public List<NoteResponseDTO> getNoteList(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Note> notes = noteRepository.findByOwner(user);
        return notes.stream().map(note -> NoteResponseDTO.from(note)).toList();
    }

    @Transactional
    public Note createNote(Note newNote, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        newNote.setOwner(user);
        Note savedNote = noteRepository.save(newNote);
        return savedNote;
    }

    @Transactional
    public NoteResponseDTO updateNote(UUID id, NoteRequestDTO updatedNote, String userEmail) {
        Note existingNote = noteRepository.findById(id)
                .orElseThrow(ResourceNotFoundException::new);
        existingNote.setTitle(updatedNote.title());
        existingNote.setContent(updatedNote.content());

        Note savedNote = noteRepository.save(existingNote);
        return NoteResponseDTO.from(savedNote);
    }

    public void deleteNote(UUID id) {
        Note noteToDelete = noteRepository.findById(id)
                .orElseThrow(ResourceNotFoundException::new);
        noteRepository.delete(noteToDelete);
    }

    public Note patchNote(UUID id, Map<String, Object> updates, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Note existingNote = noteRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new RuntimeException("Note not found or you don't have permission to update it"));

        if (updates.containsKey("title")) {
            existingNote.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("content")) {
            existingNote.setContent((String) updates.get("content"));
        }

        Note savedNote = noteRepository.save(existingNote);
        return savedNote;
    }
}
