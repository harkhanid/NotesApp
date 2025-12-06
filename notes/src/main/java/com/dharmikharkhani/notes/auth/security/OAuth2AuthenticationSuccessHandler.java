package com.dharmikharkhani.notes.auth.security;

import java.io.IOException;

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

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = (String) oauthUser.getAttribute("email");

        // Check if user already exists
        boolean isNewUser = !userRepo.existsByEmail(email);

        User user = userRepo.findByEmail(email).orElseGet(()-> {
            String name = (String) oauthUser.getAttribute("name");
            if (name == null) {
                name = (String) oauthUser.getAttribute("given_name");
            }
            return userRepo.save(new User(null, name, email, "","ROLE_user","GOOGLE"));
        });

        // Create welcome note for new OAuth2 users
        if (isNewUser) {
            noteService.createWelcomeNote(user);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles(), "GOOGLE");

        // Set HttpOnly cookie with environment-based security settings
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge((int)(3600)); // seconds
        response.addCookie(cookie);
        response.sendRedirect(frontendUrl + "/home");
        }
}