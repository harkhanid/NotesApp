package com.dharmikharkhani.notes.repository;
import com.dharmikharkhani.notes.entity.Tag;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long>{
	

}
