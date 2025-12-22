package com.dharmikharkhani.notes.config;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
public class ActivityTrackingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(ActivityTrackingInterceptor.class);

    private final UserRepository userRepository;

    public ActivityTrackingInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Only track for authenticated users
        if (authentication != null && authentication.isAuthenticated()
            && !authentication.getName().equals("anonymousUser")) {

            String email = authentication.getName();

            try {
                User user = userRepository.findByEmail(email).orElse(null);

                // Only update activity for demo accounts
                if (user != null && user.getIsDemoAccount()) {
                    user.setLastActivityAt(LocalDateTime.now());
                    userRepository.save(user);
                    logger.debug("Updated activity timestamp for demo user: {}", email);
                }
            } catch (Exception e) {
                // Don't fail the request if activity tracking fails
                logger.error("Failed to update activity for user {}: {}", email, e.getMessage());
            }
        }

        return true; // Continue with the request
    }
}
