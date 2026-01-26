package com.dharmikharkhani.notes.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.AdminUserDTO;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.repository.NoteRepository;
import com.dharmikharkhani.notes.service.PGVectorSearchService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final UserRepository userRepo;
    private final NoteRepository noteRepository;
    private final PGVectorSearchService pgVectorSearchService;
    private final com.dharmikharkhani.notes.service.OpenAIEmbeddingService openAIEmbeddingService;

    public AdminController(UserRepository userRepo, NoteRepository noteRepository, PGVectorSearchService pgVectorSearchService, com.dharmikharkhani.notes.service.OpenAIEmbeddingService openAIEmbeddingService) {
        this.userRepo = userRepo;
        this.noteRepository = noteRepository;
        this.pgVectorSearchService = pgVectorSearchService;
        this.openAIEmbeddingService = openAIEmbeddingService;
    }

    /**
     * Get all users with optional filtering
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String filter) {
        List<User> users;

        if (filter == null || filter.equals("all")) {
            users = userRepo.findAll();
        } else if (filter.equals("pending")) {
            // Pending: not approved and not rejected
            users = userRepo.findByAccountApprovedAndAccountRejected(false, false);
        } else if (filter.equals("approved")) {
            users = userRepo.findByAccountApproved(true);
        } else if (filter.equals("rejected")) {
            users = userRepo.findByAccountRejected(true);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid filter parameter"));
        }

        // Convert to DTOs to avoid exposing sensitive information
        List<AdminUserDTO> userDTOs = users.stream()
            .map(user -> new AdminUserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getProvider(),
                user.getRoles(),
                user.getAccountApproved(),
                user.getAccountRejected(),
                user.getEmailVerified()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get pending users only (shorthand for /users?filter=pending)
     */
    @GetMapping("/users/pending")
    public ResponseEntity<?> getPendingUsers() {
        List<User> users = userRepo.findByAccountApprovedAndAccountRejected(false, false);

        List<AdminUserDTO> userDTOs = users.stream()
            .map(user -> new AdminUserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getProvider(),
                user.getRoles(),
                user.getAccountApproved(),
                user.getAccountRejected(),
                user.getEmailVerified()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get a specific user by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        AdminUserDTO userDTO = new AdminUserDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getProvider(),
            user.getRoles(),
            user.getAccountApproved(),
            user.getAccountRejected(),
            user.getEmailVerified()
        );

        return ResponseEntity.ok(userDTO);
    }

    /**
     * Approve a user account
     */
    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        user.setAccountApproved(true);
        user.setAccountRejected(false);
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("msg", "User approved successfully", "success", true));
    }

    /**
     * Reject a user account
     */
    @PutMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        user.setAccountApproved(false);
        user.setAccountRejected(true);
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("msg", "User rejected successfully", "success", true));
    }

    /**
     * Make a user an admin
     */
    @PutMapping("/users/{id}/make-admin")
    public ResponseEntity<?> makeAdmin(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Add ROLE_ADMIN to the user's roles if not already present
        String currentRoles = user.getRoles();
        if (currentRoles == null || currentRoles.isEmpty()) {
            user.setRoles("ROLE_ADMIN,ROLE_USER");
        } else if (!currentRoles.contains("ROLE_ADMIN")) {
            user.setRoles("ROLE_ADMIN," + currentRoles);
        }

        userRepo.save(user);

        return ResponseEntity.ok(Map.of("msg", "User promoted to admin successfully", "success", true));
    }

    /**
     * Remove admin role from a user
     */
    @PutMapping("/users/{id}/remove-admin")
    public ResponseEntity<?> removeAdmin(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Remove ROLE_ADMIN from the user's roles
        String currentRoles = user.getRoles();
        if (currentRoles != null && currentRoles.contains("ROLE_ADMIN")) {
            String newRoles = currentRoles.replace("ROLE_ADMIN,", "").replace(",ROLE_ADMIN", "").replace("ROLE_ADMIN", "");
            if (newRoles.isEmpty()) {
                newRoles = "ROLE_USER"; // Ensure at least ROLE_USER
            }
            user.setRoles(newRoles);
            userRepo.save(user);
        }

        return ResponseEntity.ok(Map.of("msg", "Admin role removed successfully", "success", true));
    }

    /**
     * Generate embeddings for all existing notes
     * This is a one-time migration endpoint to backfill embeddings
     *
     * @return Status of the migration
     */
    @PostMapping("/embeddings/migrate")
    public ResponseEntity<Map<String, Object>> migrateEmbeddings() {
        logger.info("Starting embedding migration for all existing notes");

        List<Note> allNotes = noteRepository.findAll();
        int totalNotes = allNotes.size();
        int successCount = 0;
        int failureCount = 0;

        logger.info("Found {} notes to process", totalNotes);

        for (Note note : allNotes) {
            try {
                // Check if embedding already exists
                if (pgVectorSearchService.hasEmbedding(note.getId())) {
                    logger.debug("Embedding already exists for note: {}, skipping", note.getId());
                    successCount++;
                    continue;
                }

                // Generate embedding
                pgVectorSearchService.upsertNoteEmbedding(
                        note.getId(),
                        note.getTitle(),
                        note.getContent()
                );
                successCount++;

                logger.debug("Generated embedding for note: {} ({}/{})",
                        note.getId(), successCount, totalNotes);

            } catch (Exception e) {
                logger.error("Failed to generate embedding for note: {}", note.getId(), e);
                failureCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "completed");
        response.put("totalNotes", totalNotes);
        response.put("successCount", successCount);
        response.put("failureCount", failureCount);

        logger.info("Embedding migration completed: {} success, {} failures out of {} total",
                successCount, failureCount, totalNotes);

        return ResponseEntity.ok(response);
    }

    /**
     * Re-generate embeddings for specific note IDs
     *
     * @param noteIds List of note UUIDs to regenerate embeddings for
     * @return Status of the operation
     */
    @PostMapping("/embeddings/regenerate")
    public ResponseEntity<Map<String, Object>> regenerateEmbeddings(
            @RequestBody List<String> noteIds) {

        logger.info("Regenerating embeddings for {} notes", noteIds.size());

        int successCount = 0;
        int failureCount = 0;

        for (String noteIdStr : noteIds) {
            try {
                java.util.UUID noteId = java.util.UUID.fromString(noteIdStr);
                Note note = noteRepository.findById(noteId).orElse(null);

                if (note == null) {
                    logger.warn("Note not found: {}", noteId);
                    failureCount++;
                    continue;
                }

                pgVectorSearchService.upsertNoteEmbedding(
                        note.getId(),
                        note.getTitle(),
                        note.getContent()
                );
                successCount++;

                logger.debug("Regenerated embedding for note: {}", noteId);

            } catch (Exception e) {
                logger.error("Failed to regenerate embedding for note: {}", noteIdStr, e);
                failureCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "completed");
        response.put("totalRequested", noteIds.size());
        response.put("successCount", successCount);
        response.put("failureCount", failureCount);

        return ResponseEntity.ok(response);
    }

    /**
     * Get statistics about embeddings
     *
     * @return Embedding statistics
     */
    @GetMapping("/embeddings/stats")
    public ResponseEntity<Map<String, Object>> getEmbeddingStats() {
        long totalNotes = noteRepository.count();
        long notesWithEmbeddings = pgVectorSearchService.countEmbeddings();
        long notesMissingEmbeddings = totalNotes - notesWithEmbeddings;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNotes", totalNotes);
        stats.put("notesWithEmbeddings", notesWithEmbeddings);
        stats.put("notesMissingEmbeddings", notesMissingEmbeddings);
        stats.put("coveragePercentage", totalNotes > 0 ? (notesWithEmbeddings * 100.0 / totalNotes) : 0);

        return ResponseEntity.ok(stats);
    }

    /**
     * Debug endpoint: Test semantic search step-by-step
     * Returns detailed information about what's happening in each stage
     */
    @GetMapping("/debug/search")
    public ResponseEntity<Map<String, Object>> debugSearch(@RequestParam String query) {
        logger.info("DEBUG: Testing search for query: {}", query);

        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("query", query);

        try {
            // Step 1: Test OpenAI API
            logger.debug("DEBUG: Step 1 - Testing OpenAI API");
            long startTime = System.currentTimeMillis();
            Map<java.util.UUID, Double> semanticResults = pgVectorSearchService.semanticSearch(query, 20, 0.40);
            long openAiTime = System.currentTimeMillis() - startTime;

            // Convert UUID keys to String for JSON serialization
            Map<String, Double> semanticResultsStr = new HashMap<>();
            semanticResults.forEach((uuid, score) -> semanticResultsStr.put(uuid.toString(), score));

            Map<String, Object> openAIInfo = new HashMap<>();
            openAIInfo.put("success", true);
            openAIInfo.put("responseTimeMs", openAiTime);
            openAIInfo.put("resultsCount", semanticResults.size());
            openAIInfo.put("results", semanticResultsStr);
            debugInfo.put("openAI", openAIInfo);

            // Step 2: Test keyword search
            logger.debug("DEBUG: Step 2 - Testing keyword search");
            long keywordResults = noteRepository.findAll().stream()
                .filter(note ->
                    (note.getTitle() != null && note.getTitle().toLowerCase().contains(query.toLowerCase())) ||
                    (note.getContent() != null && note.getContent().toLowerCase().contains(query.toLowerCase()))
                )
                .count();

            debugInfo.put("keywordSearch", Map.of(
                "resultsCount", keywordResults
            ));

            // Step 3: List all notes with their embedding status
            List<Map<String, Object>> allNotes = noteRepository.findAll().stream()
                .map(note -> {
                    Map<String, Object> noteInfo = new HashMap<>();
                    noteInfo.put("id", note.getId().toString());
                    noteInfo.put("title", note.getTitle());
                    noteInfo.put("contentPreview", note.getContent() != null && note.getContent().length() > 100
                        ? note.getContent().substring(0, 100) + "..."
                        : note.getContent());
                    noteInfo.put("hasEmbedding", pgVectorSearchService.hasEmbedding(note.getId()));
                    noteInfo.put("semanticScore", semanticResults.getOrDefault(note.getId(), null));
                    return noteInfo;
                })
                .collect(Collectors.toList());

            debugInfo.put("allNotes", allNotes);
            debugInfo.put("success", true);

        } catch (Exception e) {
            logger.error("DEBUG: Error during search debug", e);
            debugInfo.put("error", e.getMessage());
            debugInfo.put("errorType", e.getClass().getSimpleName());
            debugInfo.put("success", false);
        }

        return ResponseEntity.ok(debugInfo);
    }

    /**
     * Debug endpoint: Show ALL similarity scores without threshold filter
     */
    @GetMapping("/debug/similarity-scores")
    public ResponseEntity<Map<String, Object>> debugSimilarityScores(@RequestParam String query) {
        logger.info("DEBUG: Getting ALL similarity scores for query: {}", query);

        Map<String, Object> result = new HashMap<>();
        result.put("query", query);

        try {
            // Get ALL similarity scores without threshold
            Map<java.util.UUID, Double> allScores = pgVectorSearchService.debugSemanticSearch(query, 50);

            // Convert to readable format
            List<Map<String, Object>> scoresList = allScores.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue())) // Sort by score DESC
                .map(entry -> {
                    Map<String, Object> scoreInfo = new HashMap<>();
                    Note note = noteRepository.findById(entry.getKey()).orElse(null);
                    scoreInfo.put("noteId", entry.getKey().toString());
                    scoreInfo.put("title", note != null ? note.getTitle() : "Unknown");
                    scoreInfo.put("similarityScore", entry.getValue());
                    scoreInfo.put("aboveThreshold_0_40", entry.getValue() >= 0.40);
                    scoreInfo.put("aboveThreshold_0_60", entry.getValue() >= 0.60);
                    return scoreInfo;
                })
                .collect(Collectors.toList());

            result.put("totalEmbeddings", allScores.size());
            result.put("scores", scoresList);
            result.put("maxScore", allScores.values().stream().max(Double::compareTo).orElse(0.0));
            result.put("minScore", allScores.values().stream().min(Double::compareTo).orElse(0.0));
            result.put("success", true);

        } catch (Exception e) {
            logger.error("Error getting similarity scores", e);
            result.put("error", e.getMessage());
            result.put("success", false);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Debug endpoint: List all notes missing embeddings
     */
    @GetMapping("/debug/notes-without-embeddings")
    public ResponseEntity<Map<String, Object>> getNotesWithoutEmbeddings() {
        List<Note> allNotes = noteRepository.findAll();

        List<Map<String, Object>> notesMissingEmbeddings = allNotes.stream()
            .filter(note -> !pgVectorSearchService.hasEmbedding(note.getId()))
            .map(note -> {
                Map<String, Object> noteMap = new HashMap<>();
                noteMap.put("id", note.getId().toString());
                noteMap.put("title", note.getTitle() != null ? note.getTitle() : "");
                noteMap.put("contentLength", note.getContent() != null ? note.getContent().length() : 0);
                return noteMap;
            })
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("totalNotes", allNotes.size());
        response.put("notesMissingEmbeddings", notesMissingEmbeddings.size());
        response.put("notes", notesMissingEmbeddings);

        return ResponseEntity.ok(response);
    }

    /**
     * Debug endpoint: Test OpenAI API connection
     */
    @GetMapping("/debug/test-openai")
    public ResponseEntity<Map<String, Object>> testOpenAI(@RequestParam(defaultValue = "hello world") String text) {
        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("Testing OpenAI API with text: {}", text);
            long startTime = System.currentTimeMillis();

            float[] embedding = openAIEmbeddingService.generateEmbedding(text);

            long duration = System.currentTimeMillis() - startTime;

            response.put("success", true);
            response.put("testText", text);
            response.put("embeddingDimensions", embedding.length);
            response.put("responseTimeMs", duration);
            response.put("firstFewValues", new float[]{embedding[0], embedding[1], embedding[2]});
            response.put("message", "OpenAI API is working correctly!");

            logger.info("OpenAI API test successful - {}ms, {} dimensions", duration, embedding.length);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getSimpleName());
            response.put("message", "OpenAI API test failed. Check logs for details.");

            logger.error("OpenAI API test failed", e);
        }

        return ResponseEntity.ok(response);
    }
}
