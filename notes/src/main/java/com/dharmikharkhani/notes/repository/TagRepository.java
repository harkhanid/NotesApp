package com.dharmikharkhani.notes.repository;
import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.entity.Tag;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long>{

    List<Tag> findDistinctByNotesOwner(User user);

    Optional<Tag> findByName(String name);
}
