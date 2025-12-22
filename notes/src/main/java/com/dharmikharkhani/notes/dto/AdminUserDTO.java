package com.dharmikharkhani.notes.dto;

public class AdminUserDTO {
    private Long id;
    private String email;
    private String name;
    private String provider;
    private String roles;
    private Boolean accountApproved;
    private Boolean accountRejected;
    private Boolean emailVerified;

    public AdminUserDTO(Long id, String email, String name, String provider, String roles,
                       Boolean accountApproved, Boolean accountRejected, Boolean emailVerified) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.provider = provider;
        this.roles = roles;
        this.accountApproved = accountApproved;
        this.accountRejected = accountRejected;
        this.emailVerified = emailVerified;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getRoles() {
        return roles;
    }

    public void setRoles(String roles) {
        this.roles = roles;
    }

    public Boolean getAccountApproved() {
        return accountApproved;
    }

    public void setAccountApproved(Boolean accountApproved) {
        this.accountApproved = accountApproved;
    }

    public Boolean getAccountRejected() {
        return accountRejected;
    }

    public void setAccountRejected(Boolean accountRejected) {
        this.accountRejected = accountRejected;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
