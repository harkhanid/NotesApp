package com.dharmikharkhani.notes.auth.service;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService{

    private final UserRepository repo;
    
    public CustomUserDetailsService(UserRepository repo) { this.repo = repo; }


	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		// TODO Auto-generated method stub
		User u = repo.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException("User not found"));
		var authorities = (u.getRoles() == null || u.getRoles().isBlank())
	            ? Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"))
	                    : Arrays.stream(u.getRoles().split(","))
		                    .map(String::trim)
		                    .map(SimpleGrantedAuthority::new)
		                    .collect(Collectors.toList());

		// OAuth users (GOOGLE) don't have passwords, so use a placeholder
		// They authenticate via OAuth flow, not via password
		String password = (u.getPassword() != null) ? u.getPassword() : "OAUTH_USER_NO_PASSWORD";

		return new org.springframework.security.core.userdetails.User(u.getEmail(), password, authorities);
	}
    
}
