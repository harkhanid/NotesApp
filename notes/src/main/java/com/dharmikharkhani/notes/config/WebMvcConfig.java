package com.dharmikharkhani.notes.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final ActivityTrackingInterceptor activityTrackingInterceptor;

    public WebMvcConfig(ActivityTrackingInterceptor activityTrackingInterceptor) {
        this.activityTrackingInterceptor = activityTrackingInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(activityTrackingInterceptor)
                .addPathPatterns("/api/**") // Track all API requests
                .excludePathPatterns("/api/auth/login", "/api/auth/register"); // Exclude public endpoints
    }
}
