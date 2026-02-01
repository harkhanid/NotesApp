package com.dharmikharkhani.notes.auth.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.dharmikharkhani.notes.service.DemoAccountService;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
	    private static final int INACTIVITY_THRESHOLD_HOURS = 2;

		private final UserRepository userRepo;
	    private final BCryptPasswordEncoder passwordEncoder;
	    private final AuthenticationManager authenticationManager;
	    private final JwtUtil jwtUtil;
	    private final NoteService noteService;
	    private final EmailService emailService;
	    private final TokenService tokenService;
	    private final DemoAccountService demoAccountService;

	    @Value("${app.cookie.secure}")
	    private boolean cookieSecure;

	    @Value("${app.cookie.same-site}")
	    private String cookieSameSite;

	    public AuthController(UserRepository userRepo, BCryptPasswordEncoder passwordEncoder,
                              AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                              NoteService noteService, EmailService emailService, TokenService tokenService,
                              DemoAccountService demoAccountService) {
	        this.userRepo = userRepo;
	        this.passwordEncoder = passwordEncoder;
	        this.authenticationManager = authenticationManager;
	        this.jwtUtil = jwtUtil;
	        this.noteService = noteService;
	        this.emailService = emailService;
	        this.tokenService = tokenService;
	        this.demoAccountService = demoAccountService;
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
	            // If user exists, reject registration
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already registered."));
	        }

	        // Create new user
	        User u = new User();
	        u.setEmail(email);
            u.setName(name);
	        u.setPassword(passwordEncoder.encode(password));
	        u.setRoles("ROLE_user");
            u.setProvider("JWT");
            u.setEmailVerified(false);
            u.setAccountApproved(false);  // Requires admin approval
            u.setAccountRejected(false);

	        User savedUser = userRepo.save(u);

	        // Create welcome note for new user
	        noteService.createWelcomeNote(savedUser);

	        return ResponseEntity.ok(Map.of("msg", "Account created. Pending admin approval.", "success", true));
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

	        // Check and reset demo account if needed
	        if (u.getIsDemoAccount() && shouldResetDemoAccount(u)) {
	            logger.info("Resetting demo account {} due to inactivity", email);
	            demoAccountService.resetDemoAccount(u);
	            // Re-fetch user to get updated state after reset
	            u = userRepo.findByEmail(email).orElseThrow();
	        }

	        // Check if account is rejected
	        if (u.getAccountRejected()) {
	            return ResponseEntity.status(403).body(Map.of("error", "account rejected", "email", email));
	        }

	        // Check if account is approved (only for JWT provider, OAuth users are auto-approved)
	        if ("JWT".equals(u.getProvider()) && !u.getAccountApproved()) {
	            return ResponseEntity.status(403).body(Map.of("error", "account pending approval", "email", email));
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
	        return ResponseEntity.ok(new UserResponseDTO(user.getId(), user.getEmail(), user.getName(), user.getRoles()));
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

        // Email verification endpoints removed - using manual admin approval instead
        // @GetMapping("/verify-email") - DEPRECATED
        // @PostMapping("/resend-verification") - DEPRECATED

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
            } catch (IOException e) {
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

        /**
         * Check if demo account should be reset based on inactivity
         * @param user User to check
         * @return true if account should be reset, false otherwise
         */
        private boolean shouldResetDemoAccount(User user) {
            if (user.getLastActivityAt() == null) {
                // First login or already reset
                return true;
            }
            LocalDateTime threshold = LocalDateTime.now().minusHours(INACTIVITY_THRESHOLD_HOURS);
            return user.getLastActivityAt().isBefore(threshold);
        }
}
