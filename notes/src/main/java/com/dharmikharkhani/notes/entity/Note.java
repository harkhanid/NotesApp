package com.dharmikharkhani.notes.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.dharmikharkhani.notes.auth.model.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
public class Note {

        @Id
        @GeneratedValue(generator = "UUID")
        @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
        )
        private UUID id;

	    private String title;

	    @Column(columnDefinition = "TEXT")
	    private String content;

	    @ManyToOne
	    @JoinColumn(name = "owner_id")
        @JsonIgnore
	    private User owner;

	    @ManyToMany(fetch = FetchType.EAGER)
	    @JoinTable(
	        name = "note_tags",
	        joinColumns = @JoinColumn(name = "note_id"),
	        inverseJoinColumns = @JoinColumn(name = "tag_id")
	    )
	    private Set<Tag> tags = new HashSet<>();

	    @ManyToMany(fetch = FetchType.EAGER)
	    @JoinTable(
	        name = "note_shared_users",
	        joinColumns = @JoinColumn(name = "note_id"),
	        inverseJoinColumns = @JoinColumn(name = "user_id")
	    )
        @JsonIgnore
	    private Set<User> sharedWith = new HashSet<>();

	    @CreatedDate
	    @Column(nullable = false, updatable = false)
	    private LocalDateTime createdAt;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public User getOwner() {
		return owner;
	}

	public void setOwner(User owner) {
		this.owner = owner;
	}

	public Set<Tag> getTags() {
		return tags;
	}

	public void setTags(Set<Tag> tags) {
		this.tags = tags;
	}

	public Set<User> getSharedWith() {
		return sharedWith;
	}

	public void setSharedWith(Set<User> sharedWith) {
		this.sharedWith = sharedWith;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}

