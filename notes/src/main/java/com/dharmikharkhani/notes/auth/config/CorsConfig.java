package com.dharmikharkhani.notes.auth.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.collaboration.url:}")
    private String collaborationUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow both frontend and collaboration server origins
        List<String> allowedOrigins = new ArrayList<>();

        // Split frontend URL by comma to support multiple origins
        if (frontendUrl != null && !frontendUrl.isEmpty()) {
            String[] frontendUrls = frontendUrl.split(",");
            for (String url : frontendUrls) {
                allowedOrigins.add(url.trim());
            }
        }

        if (collaborationUrl != null && !collaborationUrl.isEmpty()) {
            allowedOrigins.add(collaborationUrl);
        }

        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
