package com.dharmikharkhani.notes.service;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.exception.ResourceNotFoundException;
import com.dharmikharkhani.notes.repository.NoteRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@Service
public class AuthorizationService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;

    public AuthorizationService(UserRepository userRepository, NoteRepository noteRepository) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
    }

    //Note: Currently, Logic is similar to @isAllowedToDeleteNote
    //but with collabration feature, it would allow collabrator to edit notes
    public boolean isAllowedToEditNote(@PathVariable UUID noteId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return noteRepository.findById(noteId).map(note -> note.getOwner().getId().equals(user.getId())).orElseThrow(ResourceNotFoundException::new);
    }

    public boolean isAllowedToDeleteNote(@PathVariable UUID noteId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return noteRepository.findById(noteId).map(note -> note.getOwner().getId().equals(user.getId())).orElseThrow(ResourceNotFoundException::new);
    }
}
