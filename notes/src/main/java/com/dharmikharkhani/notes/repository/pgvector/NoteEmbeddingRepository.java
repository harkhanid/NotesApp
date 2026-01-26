package com.dharmikharkhani.notes.repository.pgvector;

import com.dharmikharkhani.notes.entity.pgvector.NoteEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteEmbeddingRepository extends JpaRepository<NoteEmbedding, UUID> {

    Optional<NoteEmbedding> findByNoteId(UUID noteId);

    boolean existsByNoteId(UUID noteId);

    void deleteByNoteId(UUID noteId);

    /**
     * Find similar notes using cosine similarity with pgvector
     *
     * @param queryEmbedding The embedding vector to search for
     * @param limit Maximum number of results to return
     * @param threshold Minimum similarity threshold (0-1, where 1 is most similar)
     * @return List of note IDs with their similarity scores
     */
    @Query(value = """
        SELECT
            note_id as noteId,
            1 - (embedding <=> CAST(:queryEmbedding AS vector)) as similarity
        FROM note_embeddings
        WHERE 1 - (embedding <=> CAST(:queryEmbedding AS vector)) >= :threshold
        ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<SimilarityResult> findSimilarNotes(
        @Param("queryEmbedding") String queryEmbedding,
        @Param("limit") int limit,
        @Param("threshold") double threshold
    );

    /**
     * Find similar notes WITHOUT threshold filter (for debugging)
     */
    @Query(value = """
        SELECT
            note_id as noteId,
            1 - (embedding <=> CAST(:queryEmbedding AS vector)) as similarity
        FROM note_embeddings
        ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<SimilarityResult> findSimilarNotesNoThreshold(
        @Param("queryEmbedding") String queryEmbedding,
        @Param("limit") int limit
    );

    /**
     * Projection interface for similarity search results
     */
    interface SimilarityResult {
        UUID getNoteId();
        Double getSimilarity();
    }
}
