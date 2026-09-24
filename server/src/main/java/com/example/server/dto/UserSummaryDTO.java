package com.example.server.dto;

public class UserSummaryDTO {
    private String id;
    private String name;
    private String email;
    private String username;
    private String role;
    private String profileImage;
    private String team;
    private Boolean emailVerified;
    
    public UserSummaryDTO() {
    }
    
    public UserSummaryDTO(String id, String name, String email, String username, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.username = username;
        this.role = role;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
}
