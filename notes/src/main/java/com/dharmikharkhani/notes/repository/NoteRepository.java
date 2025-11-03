package com.dharmikharkhani.notes.repository;
import com.dharmikharkhani.notes.entity.Note;
import com.dharmikharkhani.notes.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID>{

    Optional<Note> findByIdAndOwner(UUID id, User owner);

    List<Note> findByOwner(User owner);

    @Query("SELECT DISTINCT n FROM Note n LEFT JOIN n.tags t WHERE (n.owner = :user OR :user MEMBER OF n.sharedWith) AND (n.title LIKE %:keyword% OR n.content LIKE %:keyword% OR t.name LIKE %:keyword%)")
    List<Note> searchNotesByKeyword(@Param("user") User user, @Param("keyword") String keyword);
}