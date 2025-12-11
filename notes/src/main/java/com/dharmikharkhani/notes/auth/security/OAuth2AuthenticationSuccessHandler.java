package com.dharmikharkhani.notes.auth.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.service.NoteService;

import jakarta.servlet.ServletException;
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

	 @Value("${app.cookie.same-site}")
	 private String cookieSameSite;

	 public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, UserRepository userRepo, NoteService noteService) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
        this.noteService = noteService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = (String) oauthUser.getAttribute("email");

        // User should already exist (created by CustomOAuth2UserService)
        // If not, this is a fallback - but ideally CustomOAuth2UserService should handle this
        User user = userRepo.findByEmail(email).orElseGet(() -> {
            String name = (String) oauthUser.getAttribute("name");
            if (name == null) {
                name = (String) oauthUser.getAttribute("given_name");
            }

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : email);
            newUser.setRoles("ROLE_USER");
            newUser.setProvider("GOOGLE");
            newUser.setEmailVerified(true);

            User savedUser = userRepo.save(newUser);

            // Create welcome note for new users
            try {
                noteService.createWelcomeNote(savedUser);
            } catch (Exception e) {
                // Log error but don't fail OAuth flow
                logger.error("Failed to create welcome note: {}", e.getMessage());
            }

            return savedUser;
        });

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles(), user.getProvider());

        // Set HttpOnly cookie with environment-based security settings
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .path("/")
                .httpOnly(true)
                .sameSite(cookieSameSite)
                .secure(cookieSecure)
                .maxAge(3600)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect to dashboard
        response.sendRedirect(frontendUrl + "/dashboard");
    }
}