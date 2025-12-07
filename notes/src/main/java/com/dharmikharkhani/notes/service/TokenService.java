package com.dharmikharkhani.notes.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.dharmikharkhani.notes.auth.model.User;

@Service
public class TokenService {

    private static final long TOKEN_EXPIRY_HOURS = 1;

    public String generateToken() {
        return UUID.randomUUID().toString();
    }

    public LocalDateTime getTokenExpiry() {
        return LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS);
    }

    public boolean isTokenExpired(LocalDateTime tokenExpiry) {
        return tokenExpiry == null || LocalDateTime.now().isAfter(tokenExpiry);
    }

    public void setVerificationToken(User user) {
        user.setVerificationToken(generateToken());
        user.setVerificationTokenExpiry(getTokenExpiry());
    }

    public void setPasswordResetToken(User user) {
        user.setPasswordResetToken(generateToken());
        user.setPasswordResetTokenExpiry(getTokenExpiry());
    }

    public void clearVerificationToken(User user) {
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
    }

    public void clearPasswordResetToken(User user) {
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
    }
}
