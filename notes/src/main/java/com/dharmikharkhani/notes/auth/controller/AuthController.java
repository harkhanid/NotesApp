package com.dharmikharkhani.notes.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.auth.security.JwtUtil;
import com.dharmikharkhani.notes.dto.UserResponseDTO;
import com.dharmikharkhani.notes.service.NoteService;
import com.dharmikharkhani.notes.service.EmailService;
import com.dharmikharkhani.notes.service.TokenService;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
		@Autowired
	 	private final UserRepository userRepo;
	    private final BCryptPasswordEncoder passwordEncoder;
	    private final AuthenticationManager authenticationManager;
	    private final JwtUtil jwtUtil;
	    private final NoteService noteService;
	    private final EmailService emailService;
	    private final TokenService tokenService;

	    @Value("${app.cookie.secure}")
	    private boolean cookieSecure;

	    @Value("${app.cookie.same-site}")
	    private String cookieSameSite;

	    public AuthController(UserRepository userRepo, BCryptPasswordEncoder passwordEncoder,
	                          AuthenticationManager authenticationManager, JwtUtil jwtUtil,
	                          NoteService noteService, EmailService emailService, TokenService tokenService) {
	        this.userRepo = userRepo;
	        this.passwordEncoder = passwordEncoder;
	        this.authenticationManager = authenticationManager;
	        this.jwtUtil = jwtUtil;
	        this.noteService = noteService;
	        this.emailService = emailService;
	        this.tokenService = tokenService;
	    }

	    @PostMapping("/register")
	    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
	        String email = body.get("email");
	        String password = body.get("password");
	        String name = body.get("name");
	        if (email == null || password == null || name == null) return ResponseEntity.badRequest().body("email, password, and name required");

	        // Check if user already exists
	        User existingUser = userRepo.findByEmail(email).orElse(null);

	        if (existingUser != null) {
	            // If user exists and is already verified, reject registration
	            if (existingUser.getEmailVerified()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already registered. Please login."));
	            }

	            // If user exists but is NOT verified, update their info and resend verification email
	            existingUser.setName(name);
	            existingUser.setPassword(passwordEncoder.encode(password));

	            // Generate new verification token
	            tokenService.setVerificationToken(existingUser);

	            User savedUser = userRepo.save(existingUser);

	            // Send verification email
	            try {
	                emailService.sendVerificationEmail(savedUser, savedUser.getVerificationToken());
	            } catch (MessagingException e) {
	                return ResponseEntity.status(500).body(Map.of("error", "Failed to send verification email"));
	            }

	            return ResponseEntity.ok(Map.of("msg", "Verification email resent", "emailSent", true));
	        }

	        // Create new user
	        User u = new User();
	        u.setEmail(email);
            u.setName(name);
	        u.setPassword(passwordEncoder.encode(password));
	        u.setRoles("ROLE_user");
            u.setProvider("JWT");
            u.setEmailVerified(false);

            // Generate verification token
            tokenService.setVerificationToken(u);

	        User savedUser = userRepo.save(u);

	        // Create welcome note for new user
	        noteService.createWelcomeNote(savedUser);

	        // Send verification email
	        try {
	            emailService.sendVerificationEmail(savedUser, savedUser.getVerificationToken());
	        } catch (MessagingException e) {
	            return ResponseEntity.status(500).body(Map.of("error", "Failed to send verification email"));
	        }

	        return ResponseEntity.ok(Map.of("msg", "user created", "emailSent", true));
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

	        // Check if email is verified (only for JWT provider, skip for OAuth)
	        if ("JWT".equals(u.getProvider()) && !u.getEmailVerified()) {
	            return ResponseEntity.status(403).body(Map.of("error", "email not verified", "email", email));
	        }

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
	        return ResponseEntity.ok(new UserResponseDTO(user.getId(), user.getEmail(), user.getName()));
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

        /**
         * Get JWT token for WebSocket authentication
         * Since the main token is httpOnly, we need a way for JavaScript to access it
         * This endpoint returns the token so it can be sent with WebSocket connections
         */
        @GetMapping("/websocket-token")
        public ResponseEntity<?> getWebSocketToken(Authentication authentication) {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
            }

            // Get the user and generate a fresh token
            User user = userRepo.findByEmail(authentication.getName()).orElseThrow();
            String token = jwtUtil.generateToken(user.getUsername(), user.getRoles(), "LOCAL");

            return ResponseEntity.ok(Map.of("token", token));
        }

        /**
         * Check if a user exists by email
         * Used for validating email addresses before sharing notes
         */
        @GetMapping("/check-email")
        public ResponseEntity<?> checkEmailExists(@RequestParam String email, Authentication authentication) {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
            }

            boolean exists = userRepo.findByEmail(email).isPresent();
            return ResponseEntity.ok(Map.of("exists", exists, "email", email));
        }

        /**
         * Verify email address with token
         */
        @GetMapping("/verify-email")
        public ResponseEntity<?> verifyEmail(@RequestParam String token) {
            User user = userRepo.findByVerificationToken(token)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid verification token"));
            }

            if (tokenService.isTokenExpired(user.getVerificationTokenExpiry())) {
                return ResponseEntity.status(400).body(Map.of("error", "Verification token has expired"));
            }

            user.setEmailVerified(true);
            tokenService.clearVerificationToken(user);
            userRepo.save(user);

            return ResponseEntity.ok(Map.of("msg", "Email verified successfully", "success", true));
        }

        /**
         * Resend verification email
         */
        @PostMapping("/resend-verification")
        public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> body) {
            String email = body.get("email");
            if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Email required"));

            User user = userRepo.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            if (user.getEmailVerified()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already verified"));
            }

            // Generate new verification token
            tokenService.setVerificationToken(user);
            userRepo.save(user);

            // Send verification email
            try {
                emailService.sendVerificationEmail(user, user.getVerificationToken());
            } catch (MessagingException e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to send verification email"));
            }

            return ResponseEntity.ok(Map.of("msg", "Verification email sent", "success", true));
        }

        /**
         * Request password reset
         */
        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
            String email = body.get("email");
            if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Email required"));

            User user = userRepo.findByEmail(email).orElse(null);

            // Always return success to prevent email enumeration
            if (user == null) {
                return ResponseEntity.ok(Map.of("msg", "If that email exists, a password reset link has been sent", "success", true));
            }

            // Only send reset email for JWT provider (not OAuth users)
            if (!"JWT".equals(user.getProvider())) {
                return ResponseEntity.ok(Map.of("msg", "If that email exists, a password reset link has been sent", "success", true));
            }

            // Generate password reset token
            tokenService.setPasswordResetToken(user);
            userRepo.save(user);

            // Send password reset email
            try {
                emailService.sendPasswordResetEmail(user, user.getPasswordResetToken());
            } catch (MessagingException e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to send password reset email"));
            }

            return ResponseEntity.ok(Map.of("msg", "If that email exists, a password reset link has been sent", "success", true));
        }

        /**
         * Validate password reset token
         */
        @GetMapping("/validate-reset-token")
        public ResponseEntity<?> validateResetToken(@RequestParam String token) {
            if (token == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token required", "valid", false));
            }

            User user = userRepo.findByPasswordResetToken(token).orElse(null);
            if (user == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid reset token", "valid", false));
            }

            if (tokenService.isTokenExpired(user.getPasswordResetTokenExpiry())) {
                return ResponseEntity.status(400).body(Map.of("error", "Reset token has expired", "valid", false));
            }

            return ResponseEntity.ok(Map.of("msg", "Token is valid", "valid", true));
        }

        /**
         * Reset password with token
         */
        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
            String token = body.get("token");
            String newPassword = body.get("password");

            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token and password required"));
            }

            User user = userRepo.findByPasswordResetToken(token).orElse(null);
            if (user == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid reset token"));
            }

            if (tokenService.isTokenExpired(user.getPasswordResetTokenExpiry())) {
                return ResponseEntity.status(400).body(Map.of("error", "Reset token has expired"));
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            tokenService.clearPasswordResetToken(user);
            userRepo.save(user);

            return ResponseEntity.ok(Map.of("msg", "Password reset successfully", "success", true));
        }
}
