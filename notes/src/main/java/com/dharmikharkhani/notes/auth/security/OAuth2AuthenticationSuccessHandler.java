package com.dharmikharkhani.notes.auth.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler{
	 private final JwtUtil jwtUtil;
	 private final UserRepository userRepo;

	 public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, UserRepository userRepo) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = (String) oauthUser.getAttribute("email");
        User user = userRepo.findByEmail(email).orElseGet(()-> userRepo.save(new User(null, email, email, "","ROLE_user","GOOGLE")));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles(), "GOOGLE");

        // Set HttpOnly cookie (recommended) - adjust domain/path/secure in prod
        Cookie cookie = new Cookie("ACCESS_TOKEN", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // true in production (HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge((int)(3600)); // seconds
        response.addCookie(cookie);
        response.sendRedirect("http://localhost:5173/home");
        }
}