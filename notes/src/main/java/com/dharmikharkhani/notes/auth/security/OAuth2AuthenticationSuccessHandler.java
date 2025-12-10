package com.dharmikharkhani.notes.auth.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.service.NoteService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler{
	 private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

	 private final JwtUtil jwtUtil;
	 private final UserRepository userRepo;
	 private final NoteService noteService;

	 @Value("${app.frontend.url}")
	 private String frontendUrl;

	 @Value("${app.cookie.secure}")
	 private boolean cookieSecure;

	 public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, UserRepository userRepo, NoteService noteService) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
        this.noteService = noteService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = (String) oauthUser.getAttribute("email");

            logger.info("OAuth success handler - processing user: {}", email);

            // User already exists (created in CustomOAuth2UserService)
            // Check if this is a new user for welcome note
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User should exist after OAuth authentication"));

            logger.info("User found: {}, emailVerified: {}", user.getEmail(), user.getEmailVerified());

            // Create welcome note only if user was just created (no notes exist)
            // Note: We can't use a simple boolean here since user is created in CustomOAuth2UserService
            // Instead, check if user has any notes
            if (!user.getEmailVerified()) {
                // New OAuth user - set email as verified and create welcome note
                user.setEmailVerified(true);
                userRepo.save(user);
                logger.info("Marked user as email verified");

                // Try to create welcome note, but don't fail the entire OAuth flow if it fails
                try {
                    noteService.createWelcomeNote(user);
                    logger.info("Welcome note created successfully");
                } catch (Exception e) {
                    // Log the error but continue with authentication
                    logger.error("Failed to create welcome note for OAuth user: {}", e.getMessage(), e);
                }
            }

            logger.info("Generating JWT token for user: {}", email);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRoles(), user.getProvider());

            // Set HttpOnly cookie with environment-based security settings
            Cookie cookie = new Cookie("token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(cookieSecure);
            cookie.setPath("/");
            cookie.setMaxAge((int)(3600)); // seconds
            response.addCookie(cookie);

            logger.info("Redirecting to: {}/dashboard", frontendUrl);
            response.sendRedirect(frontendUrl + "/dashboard");
        } catch (Exception e) {
            logger.error("OAuth authentication success handler failed: {}", e.getMessage(), e);
            throw e;
        }
    }
}