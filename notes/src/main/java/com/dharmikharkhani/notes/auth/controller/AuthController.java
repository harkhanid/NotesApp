package com.dharmikharkhani.notes.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.auth.security.JwtUtil;
import com.dharmikharkhani.notes.dto.UserResponseDTO;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
		@Autowired
	 	private final UserRepository userRepo;
	    private final BCryptPasswordEncoder passwordEncoder;
	    private final AuthenticationManager authenticationManager;
	    private final JwtUtil jwtUtil;

	    @Value("${app.cookie.secure}")
	    private boolean cookieSecure;

	    @Value("${app.cookie.same-site}")
	    private String cookieSameSite;

	    public AuthController(UserRepository userRepo, BCryptPasswordEncoder passwordEncoder,
	                          AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
	        this.userRepo = userRepo;
	        this.passwordEncoder = passwordEncoder;
	        this.authenticationManager = authenticationManager;
	        this.jwtUtil = jwtUtil;
	    }

	    @PostMapping("/register")
	    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
	        String email = body.get("email");
	        String password = body.get("password");
	        if (email == null || password == null) return ResponseEntity.badRequest().body("username and password required");
	        if (userRepo.existsByUsername(email)) return ResponseEntity.badRequest().body("username taken");

	        User u = new User();
	        u.setEmail(email);
            u.setUsername(email);
	        u.setPassword(passwordEncoder.encode(password));
	        u.setRoles("ROLE_user");
            u.setProvider("JWT");
	        userRepo.save(u);
	        return ResponseEntity.ok(Map.of("msg", "user created"));
	    }

	    @PostMapping("/login")
	    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
	        String email = body.get("email");
	        String password = body.get("password");
	        try {
	            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
	        } catch (BadCredentialsException ex) {
	            return ResponseEntity.status(401).body(Map.of("error", "invalid credentials"));
	        }
	        User u = userRepo.findByEmail(email).orElseThrow();
	        String token = jwtUtil.generateToken(u.getUsername(), u.getRoles(), "LOCAL");
            ResponseCookie cookie = ResponseCookie.from("token", token)
                    .path("/")
                    .httpOnly(true)
                    .sameSite(cookieSameSite)
                    .secure(cookieSecure)
                    .build();
			response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	        return ResponseEntity.ok(Map.of("status", "success"));
	    }

	    @GetMapping("/profile")
	    public ResponseEntity<?> getProfile(Authentication authentication) {
	        if (authentication == null || !authentication.isAuthenticated()) {
	            return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
	        }
	        User user = userRepo.findByEmail(authentication.getName()).orElseThrow();
	        return ResponseEntity.ok(new UserResponseDTO(user.getId(), user.getEmail()));
	    }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletResponse response) {
            ResponseCookie cookie = ResponseCookie.from("token", "")
                    .path("/")
                    .httpOnly(true)
                    .sameSite(cookieSameSite)
                    .secure(cookieSecure)
                    .maxAge(0)
                    .build();
            response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(Map.of("status", "success"));
        }
}
