package com.example.server.service;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.net.URLEncoder;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.dto.AuthLoginDTO;
import com.example.server.dto.AuthRegisterDTO;
import com.example.server.dto.AuthResponseDTO;
import com.example.server.dto.UserSummaryDTO;
import com.example.server.entity.EmailVerificationToken;
import com.example.server.entity.PasswordResetToken;
import com.example.server.entity.User;
import com.example.server.repository.EmailVerificationTokenRepository;
import com.example.server.repository.PasswordResetTokenRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.CustomUserDetailsService;
import com.example.server.security.JwtService;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.mail.from:no-reply@contify.local}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.dev-expose-verification-url:false}")
    private boolean exposeDevelopmentVerificationUrl;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.mail.verification-expiration-minutes:30}")
    private long verificationExpirationMinutes;

    @Value("${app.mail.verification-resend-seconds:60}")
    private long verificationResendSeconds;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       CustomUserDetailsService userDetailsService,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.mailSender = mailSender;
    }

    public AuthResponseDTO register(AuthRegisterDTO dto) {
        String email = dto.getEmail().trim().toLowerCase();
        String username = dto.getUsername().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setName(dto.getName().trim());
        user.setRole(parseRole(dto.getRole()));
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setIsActive(true);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        return issueVerification(savedUser);
    }

    public AuthResponseDTO login(AuthLoginDTO dto) {
        String email = dto.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("User account is inactive");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email verification required. Please verify your email before logging in.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(user, token);
    }

    @Transactional
    public AuthResponseDTO googleLogin(String credential, String requestedRole) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Google sign-in is not configured.");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null || !Boolean.TRUE.equals(idToken.getPayload().getEmailVerified())) {
                throw new RuntimeException("Google email verification could not be confirmed.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail().trim().toLowerCase();
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setUsername(uniqueUsername(email));
                Object googleName = payload.get("name");
                user.setName(googleName instanceof String name && !name.isBlank() ? name : email);
                user.setRole(parseRole(requestedRole == null ? "STAKEHOLDER" : requestedRole));
                user.setPasswordHash(passwordEncoder.encode(generateSecureToken()));
                user.setIsActive(true);
                user.setEmailVerified(true);
                Object googlePicture = payload.get("picture");
                if (googlePicture instanceof String picture && !picture.isBlank()) {
                    user.setAvatarUrl(picture);
                }
                user = userRepository.save(user);
            } else if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                user.setEmailVerified(true);
                user = userRepository.save(user);
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            return buildAuthResponse(user, jwtService.generateToken(userDetails));
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Google sign-in could not be completed.");
        }
    }

    @Transactional
    public AuthResponseDTO verifyEmail(String rawToken) {
        EmailVerificationToken token = emailVerificationTokenRepository
                .findByTokenHashAndUsedAtIsNull(hashToken(rawToken))
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification link."));
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This verification link has expired.");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        token.setUsedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(token);
        return buildAuthResponse(user, null);
    }

    @Transactional
    public AuthResponseDTO resendVerification(String emailValue) {
        String email = emailValue == null ? "" : emailValue.trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || Boolean.TRUE.equals(user.getEmailVerified())) {
            return verificationNotice(email);
        }
        return issueVerification(user);
    }

    @Transactional
    public void forgotPassword(String emailValue) {
        String email = (emailValue == null ? "" : emailValue.trim().toLowerCase());
        if (email.isEmpty()) {
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return;
        }

        passwordResetTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        passwordResetTokenRepository.deleteByUser(user);

        PasswordResetToken tokenEntity = new PasswordResetToken();
        tokenEntity.setUser(user);
        tokenEntity.setToken(generateSecureToken());
        tokenEntity.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        passwordResetTokenRepository.save(tokenEntity);

        String resetUrl = frontendBaseUrl + "/reset-password?token=" + tokenEntity.getToken();
        sendPasswordResetEmail(user.getEmail(), resetUrl);
    }

    @Transactional
    public void resetPassword(String tokenValue, String newPassword) {
        String token = tokenValue == null ? "" : tokenValue.trim();
        if (token.isEmpty()) {
            throw new RuntimeException("Invalid reset token.");
        }

        PasswordResetToken tokenEntity = passwordResetTokenRepository
                .findByTokenAndUsedAtIsNull(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token."));

        if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired.");
        }

        User user = tokenEntity.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenEntity.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(tokenEntity);
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private void sendPasswordResetEmail(String toEmail, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Contify Password Reset");
        message.setText("""
            We received a request to reset your Contify password.

            Use this link to set a new password (valid for 30 minutes):
            %s

            If you did not request this, you can ignore this email.
            """.formatted(resetUrl));
        mailSender.send(message);
    }

    private AuthResponseDTO buildAuthResponse(User user, String token) {
        UserSummaryDTO summary = new UserSummaryDTO();
        summary.setId(user.getId());
        summary.setName(user.getName());
        summary.setEmail(user.getEmail());
        summary.setUsername(user.getUsername());
        summary.setRole(user.getRole().name());
        summary.setProfileImage(user.getProfileImage());
        summary.setTeam(user.getTeam());
        summary.setEmailVerified(user.getEmailVerified());

        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setUser(summary);
        return response;
    }

    private AuthResponseDTO issueVerification(User user) {
        emailVerificationTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        EmailVerificationToken latest = emailVerificationTokenRepository.findTopByUserOrderByCreatedAtDesc(user).orElse(null);
        if (latest != null && latest.getCreatedAt().plusSeconds(verificationResendSeconds).isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Please wait before requesting another verification email.");
        }

        String rawToken = generateSecureToken();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(verificationExpirationMinutes));
        emailVerificationTokenRepository.save(token);

        String verificationUrl = frontendBaseUrl + "/verify-email?token=" + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        if (mailEnabled) {
            sendVerificationEmail(user.getEmail(), verificationUrl);
        }

        AuthResponseDTO response = buildAuthResponse(user, null);
        response.setEmailVerificationRequired(true);
        response.setVerificationEmail(user.getEmail());
        if (!mailEnabled && exposeDevelopmentVerificationUrl) {
            response.setDevelopmentVerificationUrl(verificationUrl);
        }
        return response;
    }

    private AuthResponseDTO verificationNotice(String email) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setEmailVerificationRequired(true);
        response.setVerificationEmail(email);
        return response;
    }

    private void sendVerificationEmail(String toEmail, String verificationUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Verify your Contify email");
        message.setText("Please verify your Contify account using this link (valid for "
                + verificationExpirationMinutes + " minutes):\n\n" + verificationUrl);
        mailSender.send(message);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest((token == null ? "" : token).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to secure verification token.", ex);
        }
    }

    private String uniqueUsername(String email) {
        String base = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.isBlank()) base = "google-user";
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    private User.UserRole parseRole(String roleValue) {
        String normalized = (roleValue == null ? "" : roleValue.trim()).toUpperCase();
        if ("CREATOR".equals(normalized)) {
            normalized = "EDITOR";
        } else if ("MANAGER".equals(normalized)) {
            normalized = "ADMIN";
        } else if ("CLIENT".equals(normalized)) {
            normalized = "STAKEHOLDER";
        }

        try {
            return User.UserRole.valueOf(normalized);
        } catch (Exception ex) {
            throw new RuntimeException("Invalid role: " + roleValue);
        }
    }
}
