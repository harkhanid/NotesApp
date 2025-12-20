package com.dharmikharkhani.notes.auth.repository;
import com.dharmikharkhani.notes.auth.model.User;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long>{

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	Optional<User> findByVerificationToken(String token);

	Optional<User> findByPasswordResetToken(String token);

	// Admin functionality - find users by account status
	List<User> findByAccountApprovedAndAccountRejected(Boolean accountApproved, Boolean accountRejected);

	List<User> findByAccountApproved(Boolean accountApproved);

	List<User> findByAccountRejected(Boolean accountRejected);

}
