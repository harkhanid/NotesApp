package com.dharmikharkhani.notes.auth.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        String errorMessage = "Authentication failed. Please try again.";

        // Extract the specific error message if available
        if (exception instanceof OAuth2AuthenticationException) {
            OAuth2AuthenticationException oauthException = (OAuth2AuthenticationException) exception;
            if (oauthException.getMessage() != null) {
                errorMessage = oauthException.getMessage();
            }
        } else if (exception.getCause() instanceof OAuth2AuthenticationException) {
            OAuth2AuthenticationException oauthException = (OAuth2AuthenticationException) exception.getCause();
            if (oauthException.getMessage() != null) {
                errorMessage = oauthException.getMessage();
            }
        }

        // Redirect to login page with error message
        String encodedError = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/login?error=" + encodedError);
    }
}
