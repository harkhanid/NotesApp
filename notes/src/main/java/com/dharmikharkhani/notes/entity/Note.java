package com.dharmikharkhani.notes.entity;

import java.util.HashSet;
import java.util.Set;

import com.dharmikharkhani.notes.auth.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

@Entity
public class Note {
	    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String title;
	    private String content;

	    @ManyToOne
	    @JoinColumn(name = "owner_id")
	    private User owner;

	    @ManyToMany
	    @JoinTable(
	        name = "note_tags",
	        joinColumns = @JoinColumn(name = "note_id"),
	        inverseJoinColumns = @JoinColumn(name = "tag_id")
	    )
	    private Set<Tag> tags = new HashSet<>();

	    @ManyToMany
	    @JoinTable(
	        name = "note_shared_users",
	        joinColumns = @JoinColumn(name = "note_id"),
	        inverseJoinColumns = @JoinColumn(name = "user_id")
	    )
	    private Set<User> sharedWith = new HashSet<>();	
	
}
