package com.dharmikharkhani.notes.service;

import com.dharmikharkhani.notes.entity.pgvector.NoteEmbedding;
import com.dharmikharkhani.notes.repository.pgvector.NoteEmbeddingRepository;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PGVectorSearchService {

    private static final Logger logger = LoggerFactory.getLogger(PGVectorSearchService.class);
    private static final double DEFAULT_SIMILARITY_THRESHOLD = 0.7;
    private static final int DEFAULT_MAX_RESULTS = 20;

    @Autowired
    private NoteEmbeddingRepository noteEmbeddingRepository;

    @Autowired
    private OpenAIEmbeddingService openAIEmbeddingService;

    /**
     * Create or update embedding for a note
     *
     * @param noteId Note UUID
     * @param title Note title
     * @param content Note content
     */
    @Transactional("pgvectorTransactionManager")
    public void upsertNoteEmbedding(UUID noteId, String title, String content) {
        try {
            logger.debug("Upserting embedding for note: {}", noteId);

            // Calculate content hash to detect changes
            String contentHash = calculateContentHash(title, content);

            // Check if embedding exists and if content changed
            Optional<NoteEmbedding> existingEmbedding = noteEmbeddingRepository.findByNoteId(noteId);

            if (existingEmbedding.isPresent() &&
                contentHash.equals(existingEmbedding.get().getContentHash())) {
                logger.debug("Content unchanged for note {}, skipping embedding generation", noteId);
                return;
            }

            // Generate new embedding
            float[] embedding = openAIEmbeddingService.generateNoteEmbedding(title, content);

            if (existingEmbedding.isPresent()) {
                // Update existing embedding
                NoteEmbedding noteEmbedding = existingEmbedding.get();
                noteEmbedding.setEmbedding(embedding);
                noteEmbedding.setContentHash(contentHash);
                noteEmbeddingRepository.save(noteEmbedding);
                logger.info("Updated embedding for note: {}", noteId);
            } else {
                // Create new embedding
                NoteEmbedding noteEmbedding = new NoteEmbedding(noteId, embedding, contentHash);
                noteEmbeddingRepository.save(noteEmbedding);
                logger.info("Created embedding for note: {}", noteId);
            }

        } catch (Exception e) {
            logger.error("========================================");
            logger.error("EMBEDDING GENERATION FAILED");
            logger.error("Note ID: {}", noteId);
            logger.error("Title: {}", title);
            logger.error("Content Length: {}", content != null ? content.length() : 0);
            logger.error("Error Type: {}", e.getClass().getSimpleName());
            logger.error("Error Message: {}", e.getMessage());
            logger.error("Full Stack Trace:", e);
            logger.error("========================================");
            // Don't throw - we don't want embedding failures to break note operations
        }
    }

    /**
     * Delete embedding for a note
     *
     * @param noteId Note UUID
     */
    @Transactional("pgvectorTransactionManager")
    public void deleteNoteEmbedding(UUID noteId) {
        try {
            if (noteEmbeddingRepository.existsByNoteId(noteId)) {
                noteEmbeddingRepository.deleteByNoteId(noteId);
                logger.info("Deleted embedding for note: {}", noteId);
            }
        } catch (Exception e) {
            logger.error("Error deleting embedding for note: {}", noteId, e);
        }
    }

    /**
     * Perform semantic search on notes
     *
     * @param query Search query text
     * @param maxResults Maximum number of results
     * @param threshold Minimum similarity threshold (0-1)
     * @return Map of note IDs to similarity scores
     */
    public Map<UUID, Double> semanticSearch(String query, int maxResults, double threshold) {
        try {
            logger.debug("Performing semantic search for query: {}", query);

            // Generate embedding for the query
            float[] queryEmbedding = openAIEmbeddingService.generateEmbedding(query);

            // Convert embedding to PostgreSQL vector format
            String vectorString = floatArrayToVectorString(queryEmbedding);

            // Search for similar notes
            List<NoteEmbeddingRepository.SimilarityResult> results =
                noteEmbeddingRepository.findSimilarNotes(vectorString, maxResults, threshold);

            // Convert to map
            Map<UUID, Double> similarityMap = results.stream()
                .collect(Collectors.toMap(
                    NoteEmbeddingRepository.SimilarityResult::getNoteId,
                    NoteEmbeddingRepository.SimilarityResult::getSimilarity
                ));

            logger.info("Semantic search found {} results for query: {} (threshold: {})", similarityMap.size(), query, threshold);
            if (similarityMap.isEmpty()) {
                logger.warn("No results above threshold {}. Consider lowering threshold or check embedding quality.", threshold);
            }
            return similarityMap;

        } catch (Exception e) {
            logger.error("Error performing semantic search", e);
            return Collections.emptyMap();
        }
    }

    /**
     * Debug method: Get ALL similarity scores without threshold filtering
     *
     * @param query Search query text
     * @param maxResults Maximum number of results
     * @return Map of note IDs to similarity scores
     */
    public Map<UUID, Double> debugSemanticSearch(String query, int maxResults) {
        try {
            logger.debug("DEBUG: Performing semantic search WITHOUT threshold for query: {}", query);

            // Generate embedding for the query
            float[] queryEmbedding = openAIEmbeddingService.generateEmbedding(query);

            // Convert embedding to PostgreSQL vector format
            String vectorString = floatArrayToVectorString(queryEmbedding);

            // Search for similar notes WITHOUT threshold
            List<NoteEmbeddingRepository.SimilarityResult> results =
                noteEmbeddingRepository.findSimilarNotesNoThreshold(vectorString, maxResults);

            // Convert to map and log ALL scores
            Map<UUID, Double> similarityMap = new HashMap<>();
            for (NoteEmbeddingRepository.SimilarityResult result : results) {
                similarityMap.put(result.getNoteId(), result.getSimilarity());
                logger.info("DEBUG: Note {} has similarity score: {}", result.getNoteId(), result.getSimilarity());
            }

            logger.info("DEBUG: Found {} total embeddings with scores ranging from {} to {}",
                similarityMap.size(),
                similarityMap.values().stream().min(Double::compareTo).orElse(0.0),
                similarityMap.values().stream().max(Double::compareTo).orElse(0.0)
            );

            return similarityMap;

        } catch (Exception e) {
            logger.error("Error performing debug semantic search", e);
            return Collections.emptyMap();
        }
    }

    /**
     * Perform semantic search with default parameters
     *
     * @param query Search query text
     * @return Map of note IDs to similarity scores
     */
    public Map<UUID, Double> semanticSearch(String query) {
        return semanticSearch(query, DEFAULT_MAX_RESULTS, DEFAULT_SIMILARITY_THRESHOLD);
    }

    /**
     * Calculate SHA-256 hash of note content for change detection
     *
     * @param title Note title
     * @param content Note content
     * @return SHA-256 hash string
     */
    private String calculateContentHash(String title, String content) {
        String combined = (title != null ? title : "") + (content != null ? content : "");
        return DigestUtils.sha256Hex(combined);
    }

    /**
     * Convert float array to PostgreSQL vector string format
     *
     * @param embedding Float array
     * @return Vector string in format "[1.0,2.0,3.0]"
     */
    private String floatArrayToVectorString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Check if embeddings exist for a note
     *
     * @param noteId Note UUID
     * @return true if embedding exists
     */
    public boolean hasEmbedding(UUID noteId) {
        return noteEmbeddingRepository.existsByNoteId(noteId);
    }

    /**
     * Count total number of embeddings
     *
     * @return count of embeddings
     */
    public long countEmbeddings() {
        return noteEmbeddingRepository.count();
    }
}
