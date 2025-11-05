package com.dharmikharkhani.notes.service;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.NoteRequestDTO;
import com.dharmikharkhani.notes.dto.NoteResponseDTO;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.entity.Tag;
import com.dharmikharkhani.notes.exception.ResourceNotFoundException;
import com.dharmikharkhani.notes.repository.NoteRepository;
import com.dharmikharkhani.notes.repository.TagRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NoteService {
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final TagRepository tagRepository;

    public NoteService(UserRepository userRepository, NoteRepository noteRepository, TagRepository tagRepository) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.tagRepository = tagRepository;
    }


    @Transactional
    public List<NoteResponseDTO> getNoteList(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Note> notes = noteRepository.findByOwner(user);
        return notes.stream().map(note -> NoteResponseDTO.from(note)).toList();
    }

    @Transactional
    public Note createNote(NoteRequestDTO newNote, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Tag> tags = new HashSet<>();
        if (newNote.tags() != null) {
            tags = newNote.tags().stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                            .orElseGet(() -> {
                                Tag newTag = new Tag();
                                newTag.setName(tagName);
                                return tagRepository.save(newTag);
                            }))
                    .collect(Collectors.toSet());
        }

        Note note = new Note();
        note.setOwner(user);
        note.setTitle(newNote.title());
        note.setContent(newNote.content());
        note.setTags(tags);

        Note savedNote = noteRepository.save(note);
        return savedNote;
    }

    @Transactional
    public NoteResponseDTO updateNote(UUID id, NoteRequestDTO updatedNote, String userEmail) {
        Note existingNote = noteRepository.findById(id)
                .orElseThrow(ResourceNotFoundException::new);

        Set<Tag> tags = new HashSet<>();
        if (updatedNote.tags() != null) {
            tags = updatedNote.tags().stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                            .orElseGet(() -> {
                                Tag newTag = new Tag();
                                newTag.setName(tagName);
                                return tagRepository.save(newTag);
                            }))
                    .collect(Collectors.toSet());
        }

        existingNote.setTitle(updatedNote.title());
        existingNote.setContent(updatedNote.content());
        existingNote.setTags(tags);

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

    @Transactional
    public List<NoteResponseDTO> searchNotes(Authentication authentication, String keyword) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<Note> notes = noteRepository.searchNotesByKeyword(user, keyword);
        return notes.stream().map(NoteResponseDTO::from).collect(Collectors.toList());
    }
}

