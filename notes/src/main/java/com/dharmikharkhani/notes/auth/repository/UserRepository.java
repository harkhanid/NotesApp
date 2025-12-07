package com.dharmikharkhani.notes.auth.repository;
import com.dharmikharkhani.notes.auth.model.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long>{

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	Optional<User> findByVerificationToken(String token);

	Optional<User> findByPasswordResetToken(String token);

}
