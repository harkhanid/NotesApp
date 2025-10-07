package com.dharmikharkhani.notes.repository;
import com.dharmikharkhani.notes.entity.Note;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long>{
	

}
