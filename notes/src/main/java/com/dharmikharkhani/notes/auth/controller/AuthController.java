package com.dharmikharkhani.notes.auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.auth.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	 private final UserRepository userRepo;
	    private final BCryptPasswordEncoder passwordEncoder;
	    private final AuthenticationManager authenticationManager;
	    private final JwtUtil jwtUtil;

	    public AuthController(UserRepository userRepo, BCryptPasswordEncoder passwordEncoder,
	                          AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
	        this.userRepo = userRepo;
	        this.passwordEncoder = passwordEncoder;
	        this.authenticationManager = authenticationManager;
	        this.jwtUtil = jwtUtil;
	    }

	    @PostMapping("/register")
	    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
	        String username = body.get("username");
	        String password = body.get("password");
	        if (username == null || password == null) return ResponseEntity.badRequest().body("username and password required");
	        if (userRepo.existsByUsername(username)) return ResponseEntity.badRequest().body("username taken");

	        User u = new User();
	        u.setUsername(username);
	        u.setPassword(passwordEncoder.encode(password));
	        u.setRoles("ROLE_USER");
	        userRepo.save(u);
	        return ResponseEntity.ok(Map.of("msg", "user created"));
	    }

	    @PostMapping("/login")
	    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
	        String username = body.get("username");
	        String password = body.get("password");
	        try {
	            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
	        } catch (BadCredentialsException ex) {
	            return ResponseEntity.status(401).body(Map.of("error", "invalid credentials"));
	        }
	        User u = userRepo.findByUsername(username).orElseThrow();
	        String token = jwtUtil.generateToken(u.getUsername(), u.getRoles(), "LOCAL");
	        return ResponseEntity.ok(Map.of("token", token));
	    }
}
