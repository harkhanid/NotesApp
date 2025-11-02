package com.dharmikharkhani.notes.auth.config;

import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.dharmikharkhani.notes.auth.security.CustomOAuth2UserService;
import com.dharmikharkhani.notes.auth.security.JwtAuthFilter;
import com.dharmikharkhani.notes.auth.security.JwtUtil;
import com.dharmikharkhani.notes.auth.security.OAuth2AuthenticationSuccessHandler;
import com.dharmikharkhani.notes.auth.service.CustomUserDetailsService;


@Configuration
@EnableMethodSecurity
@Profile("!test")
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOauth2UserService;
    private final OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    private final CorsConfigurationSource corsConfigurationSource;


    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtUtil jwtUtil, 
    		CustomOAuth2UserService customOauth2UserService,
    		OAuth2AuthenticationSuccessHandler oauth2SuccessHandler,
            CorsConfigurationSource corsConfigurationSource) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
		this.customOauth2UserService = customOauth2UserService;
		this.oauth2SuccessHandler = oauth2SuccessHandler;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @SuppressWarnings("deprecation")
	@Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userDetailsService);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtAuthFilter jwtFilter = new JwtAuthFilter(jwtUtil, userDetailsService);

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/login","/api/auth/register", "/login/oauth2/**", "/oauth2/**", "/oauth2/authorization/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(u -> u.userService(customOauth2UserService))
                .successHandler(oauth2SuccessHandler)
            )
            // This is the key change to prevent redirects
            .exceptionHandling(e -> e
                .authenticationEntryPoint(new org.springframework.security.web.authentication.HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED))
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}
