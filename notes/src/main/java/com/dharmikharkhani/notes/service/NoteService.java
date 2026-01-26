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
    private final PGVectorSearchService pgVectorSearchService;

    public NoteService(UserRepository userRepository, NoteRepository noteRepository, TagRepository tagRepository, PGVectorSearchService pgVectorSearchService) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.tagRepository = tagRepository;
        this.pgVectorSearchService = pgVectorSearchService;
    }


    @Transactional
    public List<NoteResponseDTO> getNoteList(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        // Get notes owned by user AND notes shared with user
        List<Note> notes = noteRepository.findByOwnerOrSharedWith(user);
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

        // Generate embedding for the new note asynchronously
        pgVectorSearchService.upsertNoteEmbedding(savedNote.getId(), savedNote.getTitle(), savedNote.getContent());

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

        // Update embedding for the modified note
        pgVectorSearchService.upsertNoteEmbedding(savedNote.getId(), savedNote.getTitle(), savedNote.getContent());

        return NoteResponseDTO.from(savedNote);
    }

    public void deleteNote(UUID id) {
        Note noteToDelete = noteRepository.findById(id)
                .orElseThrow(ResourceNotFoundException::new);

        // Delete embedding first
        pgVectorSearchService.deleteNoteEmbedding(id);

        noteRepository.delete(noteToDelete);
    }

    /**
     * Update only the content of a note
     * Used by collaboration server for incremental updates
     */
    @Transactional
    public void updateNoteContent(UUID id, String content) {
        Note note = noteRepository.findById(id)
                .orElseThrow(ResourceNotFoundException::new);
        note.setContent(content);
        noteRepository.save(note);

        // Update embedding for the modified content
        pgVectorSearchService.upsertNoteEmbedding(note.getId(), note.getTitle(), note.getContent());
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

    @Transactional
    public NoteResponseDTO shareNote(UUID noteId, Set<String> emails, String ownerEmail) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException());

        // Find all users by email and add to sharedWith
        Set<User> usersToShare = emails.stream()
                .map(email -> userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found: " + email)))
                .collect(Collectors.toSet());

        note.getSharedWith().addAll(usersToShare);
        Note savedNote = noteRepository.save(note);
        return NoteResponseDTO.from(savedNote);
    }

    @Transactional
    public NoteResponseDTO removeCollaborator(UUID noteId, String collaboratorEmail, String ownerEmail) {

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException());

        User collaborator = userRepository.findByEmail(collaboratorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + collaboratorEmail));

        note.getSharedWith().remove(collaborator);
        Note savedNote = noteRepository.save(note);

        return NoteResponseDTO.from(savedNote);
    }

    /**
     * Creates a welcome note for new users
     */
    @Transactional
    public void createWelcomeNote(User user) {
        String welcomeContent = "<h2>Welcome to NotesApp! 👋</h2>" +
                "<h3>About the Developer</h3>" +
                "<p>Hi there! I'm a software engineer who loves building things. " +
                "This app is a personal project where I explore new technologies and create useful tools. " +
                "I hope you enjoy using it as much as I enjoyed building it!</p>" +
                "<h3>⚠️ Important Notice</h3>" +
                "<p><strong>This application is for educational and demonstration purposes only.</strong> " +
                "It's not a production-grade service, so please don't store sensitive or critical information here. " +
                "Feel free to explore, test features, and use it for learning!</p>" +
                "<h3>✨ Key Features</h3>" +
                "<ul>" +
                "<li><strong>Real-time Collaborative Editing:</strong> Share your notes with others and edit together in real-time! " +
                "You'll see each other's cursors and changes instantly.</li>" +
                "<li><strong>Rich Text Editor:</strong> Format your notes with headings, lists, bold, italics, and more.</li>" +
                "<li><strong>Tagging System:</strong> Organize your notes with tags for easy categorization and search.</li>" +
                "<li><strong>Note Sharing:</strong> Invite collaborators by email to work together on your notes.</li>" +
                "</ul>" +
                "<h3>🚀 Future Roadmap</h3>" +
                "<p>Exciting features coming soon:</p>" +
                "<ul>" +
                "<li><strong>Semantic Search:</strong> Find notes by meaning, not just keywords. Ask questions and get intelligent answers from your notes.</li>" +
                "<li><strong>Graph View:</strong> Visualize connections between your notes with an interactive knowledge graph.</li>" +
                "<li><strong>Smart Linking:</strong> Automatically discover and suggest related notes.</li>" +
                "<li><strong>AI-Powered Summaries:</strong> Get quick summaries of long notes.</li>" +
                "</ul>" +
                "<h3>Getting Started</h3>" +
                "<p>Here are some tips to get you started:</p>" +
                "<ol>" +
                "<li>Create a new note using the <strong>+</strong> button</li>" +
                "<li>Try adding tags to organize your notes</li>" +
                "<li>Share a note with a friend by clicking the <strong>Share</strong> button</li>" +
                "<li>Experience real-time collaboration by editing together!</li>" +
                "</ol>" +
                "<p><em>Feel free to delete this note once you're familiar with the app. Happy note-taking! 📝</em></p>";

        Note welcomeNote = new Note();
        welcomeNote.setOwner(user);
        welcomeNote.setTitle("Welcome to NotesApp!");
        welcomeNote.setContent(welcomeContent);

        // Add "welcome" tag
        Tag welcomeTag = tagRepository.findByName("welcome")
                .orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName("welcome");
                    return tagRepository.save(newTag);
                });

        Set<Tag> tags = new HashSet<>();
        tags.add(welcomeTag);
        welcomeNote.setTags(tags);

        noteRepository.save(welcomeNote);
    }
}

