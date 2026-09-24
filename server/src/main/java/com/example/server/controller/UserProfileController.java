package com.example.server.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.server.dto.ApiResponse;
import com.example.server.dto.profile.ChangePasswordRequestDTO;
import com.example.server.dto.profile.EditorStatsDTO;
import com.example.server.dto.profile.UpdateAdminProfileRequestDTO;
import com.example.server.dto.profile.UpdateAvatarRequestDTO;
import com.example.server.dto.profile.UpdateEditorProfileRequestDTO;
import com.example.server.dto.profile.UpdateNotificationPrefsRequestDTO;
import com.example.server.dto.profile.UpdateSharedProfileRequestDTO;
import com.example.server.dto.profile.UpdateStakeholderProfileRequestDTO;
import com.example.server.dto.profile.UserMeResponseDTO;
import com.example.server.entity.ClientCompanyProfile;
import com.example.server.entity.EditorProfile;
import com.example.server.entity.Task;
import com.example.server.entity.User;
import com.example.server.repository.ClientCompanyProfileRepository;
import com.example.server.repository.EditorProfileRepository;
import com.example.server.repository.TaskRepository;
import com.example.server.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@Validated
public class UserProfileController {

    private final UserRepository userRepository;
    private final EditorProfileRepository editorProfileRepository;
    private final ClientCompanyProfileRepository clientCompanyProfileRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public UserProfileController(
            UserRepository userRepository,
            EditorProfileRepository editorProfileRepository,
            ClientCompanyProfileRepository clientCompanyProfileRepository,
            TaskRepository taskRepository,
            PasswordEncoder passwordEncoder,
            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.editorProfileRepository = editorProfileRepository;
        this.clientCompanyProfileRepository = clientCompanyProfileRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<UserMeResponseDTO>> getCurrentUserProfile(Authentication authentication) {
        User user = findUserByAuthentication(authentication);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", toUserMeResponse(user)));
    }

    @PatchMapping("/users/me")
    public ResponseEntity<ApiResponse<UserMeResponseDTO>> updateSharedProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateSharedProfileRequestDTO dto) {
        User user = findUserByAuthentication(authentication);

        if (dto.getDisplayName() != null) {
            user.setDisplayName(normalize(dto.getDisplayName()));
            if (!dto.getDisplayName().isBlank()) {
                user.setName(dto.getDisplayName().trim());
            }
        }

        if (dto.getPhone() != null) {
            user.setPhone(normalize(dto.getPhone()));
        }
        if (dto.getJobTitle() != null) {
            user.setJobTitle(normalize(dto.getJobTitle()));
        }
        if (dto.getDepartment() != null) {
            user.setDepartment(normalize(dto.getDepartment()));
        }
        if (dto.getBio() != null) {
            user.setBio(normalize(dto.getBio()));
        }
        if (dto.getTimezone() != null) {
            user.setTimezone(normalizeOrDefault(dto.getTimezone(), "Asia/Kolkata"));
        }
        if (dto.getLanguage() != null) {
            user.setLanguage(normalizeOrDefault(dto.getLanguage(), "en"));
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", toUserMeResponse(saved)));
    }

    @PatchMapping("/users/me/avatar")
    public ResponseEntity<ApiResponse<UserMeResponseDTO>> updateAvatar(
            Authentication authentication,
            @Valid @RequestBody UpdateAvatarRequestDTO dto) {
        User user = findUserByAuthentication(authentication);
        user.setAvatarUrl(dto.getAvatarUrl().trim());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Avatar updated", toUserMeResponse(saved)));
    }

    @PatchMapping("/users/me/notifications")
    public ResponseEntity<ApiResponse<UserMeResponseDTO>> updateNotificationPrefs(
            Authentication authentication,
            @Valid @RequestBody UpdateNotificationPrefsRequestDTO dto) {
        User user = findUserByAuthentication(authentication);
        user.setNotificationPrefs(toJson(dto.getNotificationPrefs()));
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Notification preferences updated", toUserMeResponse(saved)));
    }

    @PatchMapping("/users/me/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO dto) {
        User user = findUserByAuthentication(authentication);

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password confirmation does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Password updated", null));
    }

    @PatchMapping("/users/me/editor")
    public ResponseEntity<ApiResponse<UserMeResponseDTO>> updateEditorProfile(
            Authentication authentication,
            @RequestBody UpdateEditorProfileRequestDTO dto) {
        User user = findUserByAuthentication(authentication);
        enforceRole(user, User.UserRole.EDITOR);

        EditorProfile profile = editorProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            EditorProfile next = new EditorProfile();
            next.setUserId(user.getId());
            return next;
        });

        if (dto.getSkills() != null) {
            profile.setSkills(toJson(dto.getSkills()));
        }
        if (dto.getContentTypes() != null) {
            profile.setContentTypes(toJson(dto.getContentTypes()));
        }
        if (dto.getPortfolioLinks() != null) {
            profile.setPortfolioLinks(toJson(dto.getPortfolioLinks()));
        }
        if (dto.getMaxConcurrentTasks() != null) {
            profile.setMaxConcurrentTasks(dto.getMaxConcurrentTasks());
        }

        editorProfileRepository.save(profile);
        return ResponseEntity.ok(ApiResponse.success("Editor profile updated", toUserMeResponse(user)));
    }

    @PatchMapping("/users/me/admin")
    public ResponseEntity<ApiResponse<UserMeResponseDTO>> updateAdminProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateAdminProfileRequestDTO dto) {
        User user = findUserByAuthentication(authentication);
        enforceRole(user, User.UserRole.ADMIN);

        ClientCompanyProfile profile = clientCompanyProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            ClientCompanyProfile next = new ClientCompanyProfile();
            next.setUserId(user.getId());
            return next;
        });

        if (dto.getCompanyName() != null) {
            profile.setCompanyName(normalize(dto.getCompanyName()));
        }
        if (dto.getIndustry() != null) {
            profile.setIndustry(normalize(dto.getIndustry()));
        }
        if (dto.getWebsite() != null) {
            profile.setWebsite(normalize(dto.getWebsite()));
        }
        if (dto.getGstNumber() != null) {
            profile.setGstNumber(normalize(dto.getGstNumber()));
        }
        if (dto.getBrandColors() != null) {
            profile.setBrandColors(toJson(dto.getBrandColors()));
        }

        clientCompanyProfileRepository.save(profile);
        return ResponseEntity.ok(ApiResponse.success("Admin profile updated", toUserMeResponse(user)));
    }

    @PatchMapping("/users/me/stakeholder")
    public ResponseEntity<ApiResponse<UserMeResponseDTO>> updateStakeholderProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateStakeholderProfileRequestDTO dto) {
        User user = findUserByAuthentication(authentication);
        enforceRole(user, User.UserRole.STAKEHOLDER);

        ClientCompanyProfile profile = clientCompanyProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            ClientCompanyProfile next = new ClientCompanyProfile();
            next.setUserId(user.getId());
            return next;
        });

        if (dto.getCompanyName() != null) {
            profile.setCompanyName(normalize(dto.getCompanyName()));
        }
        if (dto.getWebsite() != null) {
            profile.setWebsite(normalize(dto.getWebsite()));
        }
        if (dto.getBrandColors() != null) {
            profile.setBrandColors(toJson(dto.getBrandColors()));
        }

        clientCompanyProfileRepository.save(profile);
        return ResponseEntity.ok(ApiResponse.success("Stakeholder profile updated", toUserMeResponse(user)));
    }

    @GetMapping("/editor/stats")
    public ResponseEntity<ApiResponse<EditorStatsDTO>> getEditorStats(Authentication authentication) {
        User user = findUserByAuthentication(authentication);
        enforceRole(user, User.UserRole.EDITOR);

        List<Task> tasks = taskRepository.findByAssignedTo(user.getId());
        long completedCount = tasks.stream()
                .filter(task -> task.getStatus() == Task.TaskStatus.APPROVED)
                .count();

        List<Task> completedTasks = tasks.stream()
                .filter(task -> task.getStatus() == Task.TaskStatus.APPROVED)
                .toList();

        long onTimeCount = completedTasks.stream()
                .filter(task -> isOnTime(task.getUpdatedAt() == null ? null : task.getUpdatedAt().toLocalDate(), task.getDeadline()))
                .count();

        double onTimeRate = completedTasks.isEmpty() ? 0.0 : ((double) onTimeCount / completedTasks.size()) * 100.0;

        EditorStatsDTO dto = new EditorStatsDTO();
        dto.setTasksCompleted(completedCount);
        dto.setOnTimeRate(Math.round(onTimeRate * 100.0) / 100.0);

        return ResponseEntity.ok(ApiResponse.success("Editor stats fetched", dto));
    }

    private boolean isOnTime(LocalDate completedDate, LocalDate deadline) {
        if (completedDate == null || deadline == null) {
            return false;
        }
        return !completedDate.isAfter(deadline);
    }

    private void enforceRole(User user, User.UserRole expectedRole) {
        if (user.getRole() != expectedRole) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Role mismatch for this profile operation");
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeOrDefault(String value, String fallback) {
        String normalized = normalize(value);
        return normalized == null ? fallback : normalized;
    }

    private User findUserByAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String identifier = authentication.getName().trim().toLowerCase();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserMeResponseDTO toUserMeResponse(User user) {
        UserMeResponseDTO dto = new UserMeResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole() == null ? null : user.getRole().name());
        dto.setFullName(user.getName());
        dto.setDisplayName(user.getDisplayName() == null ? user.getName() : user.getDisplayName());
        dto.setPhone(user.getPhone());
        dto.setJobTitle(user.getJobTitle());
        dto.setDepartment(user.getDepartment());
        dto.setBio(user.getBio());
        dto.setTimezone(user.getTimezone());
        dto.setLanguage(user.getLanguage());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setNotificationPrefs(parseJson(user.getNotificationPrefs(), new TypeReference<Map<String, Object>>() {}, Map.of()));

        editorProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            dto.setSkills(parseJson(profile.getSkills(), new TypeReference<List<String>>() {}, new ArrayList<>()));
            dto.setContentTypes(parseJson(profile.getContentTypes(), new TypeReference<List<String>>() {}, new ArrayList<>()));
            dto.setPortfolioLinks(parseJson(profile.getPortfolioLinks(), new TypeReference<Map<String, String>>() {}, Map.of()));
            dto.setMaxConcurrentTasks(profile.getMaxConcurrentTasks());
        });

        clientCompanyProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            dto.setCompanyName(profile.getCompanyName());
            dto.setIndustry(profile.getIndustry());
            dto.setWebsite(profile.getWebsite());
            dto.setGstNumber(profile.getGstNumber());
            dto.setBrandColors(parseJson(profile.getBrandColors(), new TypeReference<Map<String, String>>() {}, Map.of()));
        });

        return dto;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON payload");
        }
    }

    private <T> T parseJson(String json, TypeReference<T> typeReference, T fallback) {
        if (json == null || json.isBlank()) {
            return fallback;
        }
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (JsonProcessingException ex) {
            return fallback;
        }
    }
}
