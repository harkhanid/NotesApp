package com.dharmikharkhani.notes.service;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.NoteResponseDTO;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.repository.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class HybridSearchService {

    private static final Logger logger = LoggerFactory.getLogger(HybridSearchService.class);

    // Weights for combining keyword and semantic search scores
    private static final double KEYWORD_WEIGHT = 0.3;
    private static final double SEMANTIC_WEIGHT = 0.7;

    // Dynamic threshold strategy: Try high precision first, fallback to high recall
    private static final double HIGH_PRECISION_THRESHOLD = 0.60;  // For highly relevant results
    private static final double HIGH_RECALL_THRESHOLD = 0.35;     // Fallback for broader results
    private static final int MIN_RESULTS_FOR_HIGH_PRECISION = 3;  // Need at least 3 results at 0.60

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PGVectorSearchService pgVectorSearchService;

    /**
     * Perform hybrid search combining keyword and semantic search
     *
     * @param authentication User authentication
     * @param query Search query
     * @return List of notes ranked by combined relevance
     */
    public List<NoteResponseDTO> hybridSearch(Authentication authentication, String query) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        logger.info("Performing hybrid search for query: {}", query);

        // 1. Get keyword search results
        List<Note> keywordResults = noteRepository.searchNotesByKeyword(user, query);
        Set<UUID> keywordNoteIds = keywordResults.stream()
                .map(Note::getId)
                .collect(Collectors.toSet());

        logger.debug("Keyword search found {} results", keywordNoteIds.size());

        // 2. Get semantic search results with dynamic threshold
        // Try high precision (0.60) first
        Map<UUID, Double> semanticScores = pgVectorSearchService.semanticSearch(
                query, 20, HIGH_PRECISION_THRESHOLD);

        logger.debug("High precision search (0.60) found {} results", semanticScores.size());

        // If we don't have enough high-quality results, fallback to broader search
        if (semanticScores.size() < MIN_RESULTS_FOR_HIGH_PRECISION) {
            logger.info("Insufficient results at 0.60 threshold, falling back to 0.35");
            semanticScores = pgVectorSearchService.semanticSearch(
                    query, 20, HIGH_RECALL_THRESHOLD);
            logger.debug("High recall search (0.35) found {} results", semanticScores.size());
        } else {
            logger.info("Found {} high-precision results at 0.60 threshold", semanticScores.size());
        }

        // 3. Filter semantic results to only include notes the user has access to
        List<Note> userNotes = noteRepository.findByOwnerOrSharedWith(user);
        Set<UUID> accessibleNoteIds = userNotes.stream()
                .map(Note::getId)
                .collect(Collectors.toSet());

        Map<UUID, Double> filteredSemanticScores = semanticScores.entrySet().stream()
                .filter(entry -> accessibleNoteIds.contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        logger.debug("Filtered semantic results to {} accessible notes", filteredSemanticScores.size());

        // 4. Combine results and calculate hybrid scores
        Map<UUID, Double> hybridScores = new HashMap<>();

        // Add keyword results with normalized scores
        for (UUID noteId : keywordNoteIds) {
            hybridScores.put(noteId, KEYWORD_WEIGHT);
        }

        // Add semantic results with weighted scores
        for (Map.Entry<UUID, Double> entry : filteredSemanticScores.entrySet()) {
            UUID noteId = entry.getKey();
            double semanticScore = entry.getValue();

            // Combine scores if note appears in both results
            if (hybridScores.containsKey(noteId)) {
                // Note appeared in both searches - boost the score
                hybridScores.put(noteId, KEYWORD_WEIGHT + (SEMANTIC_WEIGHT * semanticScore));
            } else {
                // Note only appeared in semantic search
                hybridScores.put(noteId, SEMANTIC_WEIGHT * semanticScore);
            }
        }

        logger.debug("Combined search found {} unique results", hybridScores.size());

        // 5. Sort by hybrid score and fetch notes
        List<UUID> rankedNoteIds = hybridScores.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue())) // Descending order
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // 6. Fetch and return notes in ranked order
        Map<UUID, Note> noteMap = userNotes.stream()
                .filter(note -> hybridScores.containsKey(note.getId()))
                .collect(Collectors.toMap(Note::getId, note -> note));

        List<NoteResponseDTO> rankedResults = rankedNoteIds.stream()
                .map(noteMap::get)
                .filter(Objects::nonNull)
                .map(NoteResponseDTO::from)
                .collect(Collectors.toList());

        logger.info("Hybrid search returned {} ranked results", rankedResults.size());
        return rankedResults;
    }

    /**
     * Fallback to keyword-only search if semantic search fails
     *
     * @param authentication User authentication
     * @param query Search query
     * @return List of notes from keyword search
     */
    public List<NoteResponseDTO> keywordSearchFallback(Authentication authentication, String query) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        logger.info("Performing keyword-only search for query: {}", query);

        List<Note> results = noteRepository.searchNotesByKeyword(user, query);
        return results.stream()
                .map(NoteResponseDTO::from)
                .collect(Collectors.toList());
    }
}
