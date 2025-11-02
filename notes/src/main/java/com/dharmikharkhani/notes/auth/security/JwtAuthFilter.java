package com.dharmikharkhani.notes.auth.security;
import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dharmikharkhani.notes.auth.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthFilter extends OncePerRequestFilter{
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
	
	public JwtAuthFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;

	}
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		 SecurityContextHolder.clearContext();
		 final String authHeader = request.getHeader("Authorization");
	        String email = null;
	        String token = null;

	        if (request.getCookies() != null) {
	            for (Cookie cookie : request.getCookies()) {
	                if (cookie.getName().equals("token")) {
	                    token = cookie.getValue();
	                }
	            }
	        }

	        if (token != null && jwtUtil.validateToken(token)) {
	            email = jwtUtil.extractEmail(token);
	        }

	        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
	            UserDetails ud = userDetailsService.loadUserByUsername(email);
	            var auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
	            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
	            SecurityContextHolder.getContext().setAuthentication(auth);
	        }

	        filterChain.doFilter(request, response);		
	}

}
