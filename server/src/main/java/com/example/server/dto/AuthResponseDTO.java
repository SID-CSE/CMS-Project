package com.example.server.dto;

public class AuthResponseDTO {

    private String token;
    private UserSummaryDTO user;
    private boolean emailVerificationRequired;
    private String verificationEmail;
    private String developmentVerificationUrl;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserSummaryDTO getUser() {
        return user;
    }

    public void setUser(UserSummaryDTO user) {
        this.user = user;
    }

    public boolean isEmailVerificationRequired() { return emailVerificationRequired; }
    public void setEmailVerificationRequired(boolean emailVerificationRequired) { this.emailVerificationRequired = emailVerificationRequired; }
    public String getVerificationEmail() { return verificationEmail; }
    public void setVerificationEmail(String verificationEmail) { this.verificationEmail = verificationEmail; }
    public String getDevelopmentVerificationUrl() { return developmentVerificationUrl; }
    public void setDevelopmentVerificationUrl(String developmentVerificationUrl) { this.developmentVerificationUrl = developmentVerificationUrl; }
}
