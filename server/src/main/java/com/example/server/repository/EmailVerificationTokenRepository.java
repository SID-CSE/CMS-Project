package com.example.server.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.server.entity.EmailVerificationToken;
import com.example.server.entity.User;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, String> {

    Optional<EmailVerificationToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    Optional<EmailVerificationToken> findTopByUserOrderByCreatedAtDesc(User user);

    void deleteByUser(User user);

    long deleteByExpiresAtBefore(LocalDateTime cutoff);
}
