package com.dharmikharkhani.notes.auth.security;

import java.util.Map;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService{
	private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);
	private final UserRepository userRepo;

    public CustomOAuth2UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        logger.info("CustomOAuth2UserService.loadUser() called - starting OAuth user loading");

        OAuth2User oauthUser = super.loadUser(userRequest);

        Map<String, Object> attrs = oauthUser.getAttributes();
        String email = (String) attrs.get("email");
        String name  = (String) attrs.getOrDefault("name", (String)attrs.get("given_name"));

        logger.info("CustomOAuth2UserService - loading user with email: {}", email);

        if (email == null) {
            logger.error("Email not found from OAuth2 provider");
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        // Check if user exists with this email
        User user = userRepo.findByEmail(email).orElse(null);

        if (user != null) {
            logger.info("User already exists: {}, provider: {}", email, user.getProvider());
            // User exists - check if it's a regular (LOCAL) account
            if ("LOCAL".equals(user.getProvider())) {
                logger.warn("Blocking OAuth login - LOCAL account exists for email: {}", email);
                throw new OAuth2AuthenticationException(
                    "An account with this email already exists. Please sign in with your email and password."
                );
            }
            // If it's already a GOOGLE account, continue with existing user
            logger.info("Existing GOOGLE account found, continuing with existing user");
        } else {
            // No existing user - create new OAuth user
            logger.info("Creating new OAuth user for email: {}", email);
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRoles("ROLE_USER");
            user.setProvider("GOOGLE");
            user.setEmailVerified(false); // Will be set to true in success handler
            user = userRepo.save(user);
            logger.info("New OAuth user created with ID: {}", user.getId());
        }

        logger.info("Returning OAuth2User for email: {}", email);
        return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                user.getAuthorities(),
                attrs,
                "email");
    }
}