package com.dharmikharkhani.notes.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dharmikharkhani.notes.entity.Note;

@RestController
@RequestMapping("/api")
public class NoteController {
	
	@GetMapping("/note")
	public ResponseEntity<Note> getUserNote(){
		System.out.println(SecurityContextHolder.getContext().getAuthentication().getPrincipal());
		return ResponseEntity.ok(new Note());
	}
}
