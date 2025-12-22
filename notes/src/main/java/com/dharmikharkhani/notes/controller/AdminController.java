package com.dharmikharkhani.notes.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dharmikharkhani.notes.auth.model.User;
import com.dharmikharkhani.notes.auth.repository.UserRepository;
import com.dharmikharkhani.notes.dto.AdminUserDTO;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepo;

    public AdminController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    /**
     * Get all users with optional filtering
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String filter) {
        List<User> users;

        if (filter == null || filter.equals("all")) {
            users = userRepo.findAll();
        } else if (filter.equals("pending")) {
            // Pending: not approved and not rejected
            users = userRepo.findByAccountApprovedAndAccountRejected(false, false);
        } else if (filter.equals("approved")) {
            users = userRepo.findByAccountApproved(true);
        } else if (filter.equals("rejected")) {
            users = userRepo.findByAccountRejected(true);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid filter parameter"));
        }

        // Convert to DTOs to avoid exposing sensitive information
        List<AdminUserDTO> userDTOs = users.stream()
            .map(user -> new AdminUserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getProvider(),
                user.getRoles(),
                user.getAccountApproved(),
                user.getAccountRejected(),
                user.getEmailVerified()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get pending users only (shorthand for /users?filter=pending)
     */
    @GetMapping("/users/pending")
    public ResponseEntity<?> getPendingUsers() {
        List<User> users = userRepo.findByAccountApprovedAndAccountRejected(false, false);

        List<AdminUserDTO> userDTOs = users.stream()
            .map(user -> new AdminUserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getProvider(),
                user.getRoles(),
                user.getAccountApproved(),
                user.getAccountRejected(),
                user.getEmailVerified()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get a specific user by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        AdminUserDTO userDTO = new AdminUserDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getProvider(),
            user.getRoles(),
            user.getAccountApproved(),
            user.getAccountRejected(),
            user.getEmailVerified()
        );

        return ResponseEntity.ok(userDTO);
    }

    /**
     * Approve a user account
     */
    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        user.setAccountApproved(true);
        user.setAccountRejected(false);
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("msg", "User approved successfully", "success", true));
    }

    /**
     * Reject a user account
     */
    @PutMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        user.setAccountApproved(false);
        user.setAccountRejected(true);
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("msg", "User rejected successfully", "success", true));
    }

    /**
     * Make a user an admin
     */
    @PutMapping("/users/{id}/make-admin")
    public ResponseEntity<?> makeAdmin(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Add ROLE_ADMIN to the user's roles if not already present
        String currentRoles = user.getRoles();
        if (currentRoles == null || currentRoles.isEmpty()) {
            user.setRoles("ROLE_ADMIN,ROLE_USER");
        } else if (!currentRoles.contains("ROLE_ADMIN")) {
            user.setRoles("ROLE_ADMIN," + currentRoles);
        }

        userRepo.save(user);

        return ResponseEntity.ok(Map.of("msg", "User promoted to admin successfully", "success", true));
    }

    /**
     * Remove admin role from a user
     */
    @PutMapping("/users/{id}/remove-admin")
    public ResponseEntity<?> removeAdmin(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Remove ROLE_ADMIN from the user's roles
        String currentRoles = user.getRoles();
        if (currentRoles != null && currentRoles.contains("ROLE_ADMIN")) {
            String newRoles = currentRoles.replace("ROLE_ADMIN,", "").replace(",ROLE_ADMIN", "").replace("ROLE_ADMIN", "");
            if (newRoles.isEmpty()) {
                newRoles = "ROLE_USER"; // Ensure at least ROLE_USER
            }
            user.setRoles(newRoles);
            userRepo.save(user);
        }

        return ResponseEntity.ok(Map.of("msg", "Admin role removed successfully", "success", true));
    }
}
