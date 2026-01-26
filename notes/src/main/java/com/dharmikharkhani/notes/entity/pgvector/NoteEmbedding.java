package com.dharmikharkhani.notes.entity.pgvector;

import io.hypersistence.utils.hibernate.type.array.ListArrayType;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "note_embeddings")
public class NoteEmbedding {

    @Id
    private UUID id;

    @Column(name = "note_id", nullable = false, unique = true)
    private UUID noteId;

    @Column(name = "embedding", columnDefinition = "vector(1536)")
    @org.hibernate.annotations.ColumnTransformer(
        write = "?::vector"
    )
    private String embedding;  // Store as string, PostgreSQL will cast to vector

    @Column(name = "content_hash", length = 64)
    private String contentHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public NoteEmbedding() {
    }

    public NoteEmbedding(UUID noteId, String embedding, String contentHash) {
        this.noteId = noteId;
        this.embedding = embedding;
        this.contentHash = contentHash;
    }

    // Convenience constructor that accepts float array
    public NoteEmbedding(UUID noteId, float[] embeddingArray, String contentHash) {
        this.noteId = noteId;
        this.embedding = floatArrayToVectorString(embeddingArray);
        this.contentHash = contentHash;
    }

    // Helper method to convert float[] to vector string format
    private static String floatArrayToVectorString(float[] array) {
        if (array == null) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < array.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(array[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getNoteId() {
        return noteId;
    }

    public void setNoteId(UUID noteId) {
        this.noteId = noteId;
    }

    public String getEmbedding() {
        return embedding;
    }

    public void setEmbedding(String embedding) {
        this.embedding = embedding;
    }

    // Convenience method to set embedding from float array
    public void setEmbedding(float[] embeddingArray) {
        this.embedding = floatArrayToVectorString(embeddingArray);
    }

    public String getContentHash() {
        return contentHash;
    }

    public void setContentHash(String contentHash) {
        this.contentHash = contentHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
