package com.example.server.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleSignInDTO {

    @NotBlank
    private String credential;

    private String role;

    public String getCredential() { return credential; }
    public void setCredential(String credential) { this.credential = credential; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
