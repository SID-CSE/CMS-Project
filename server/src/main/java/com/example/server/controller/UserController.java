package com.example.server.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.server.dto.ApiResponse;
import com.example.server.dto.UserProfileDTO;
import com.example.server.dto.UserSummaryDTO;
import com.example.server.entity.User;
import com.example.server.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserProfileById(
            Authentication authentication,
            @PathVariable String userId) {
        findUserByAuthentication(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", toProfileDTO(user)));
    }

    @GetMapping("/team/editors/profiles")
    public ResponseEntity<ApiResponse<List<UserProfileDTO>>> getTeamEditorProfiles(Authentication authentication) {
        User currentUser = findUserByAuthentication(authentication);
        String adminTeam = currentUser.getTeam() == null ? "" : currentUser.getTeam().trim();

        List<UserProfileDTO> editors = userRepository.findByRole(User.UserRole.EDITOR).stream()
                .filter(user -> user.getIsActive() == null || Boolean.TRUE.equals(user.getIsActive()))
                .filter(user -> {
                    if (adminTeam.isBlank()) return true;
                    String editorTeam = user.getTeam() == null ? "" : user.getTeam().trim();
                    return editorTeam.isBlank() || editorTeam.equalsIgnoreCase(adminTeam);
                })
                .map(this::toProfileDTO)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Team editor profiles fetched", editors));
    }


    @GetMapping("/editors")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getEditors() {
        List<UserSummaryDTO> editors = userRepository.findByRole(User.UserRole.EDITOR)
                .stream()
                .map(user -> {
                    UserSummaryDTO dto = new UserSummaryDTO();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setUsername(user.getUsername());
                    dto.setRole(user.getRole().name());
                    dto.setProfileImage(user.getProfileImage());
                    dto.setTeam(user.getTeam());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Editors fetched", editors));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getContacts(
            Authentication authentication,
            @RequestParam(required = false) String roles) {
        User currentUser = findUserByAuthentication(authentication);
        List<UserSummaryDTO> contacts = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> user.getIsActive() == null || Boolean.TRUE.equals(user.getIsActive()))
                .filter(user -> roles == null || roles.isBlank() || matchesRole(user, roles))
                .map(user -> {
                    UserSummaryDTO dto = new UserSummaryDTO();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setUsername(user.getUsername());
                    dto.setRole(user.getRole() == null ? null : user.getRole().name());
                    dto.setProfileImage(user.getProfileImage());
                    dto.setTeam(user.getTeam());
                    return dto;
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Contacts fetched", contacts));
    }

    private User findUserByAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String identifier = authentication.getName().trim().toLowerCase();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserProfileDTO toProfileDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole() == null ? null : user.getRole().name());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setLocation(user.getLocation());
        dto.setBio(user.getBio());
        dto.setTeam(user.getTeam());
        dto.setResponsibilities(user.getResponsibilities());
        dto.setGovernanceNotes(user.getGovernanceNotes());
        dto.setSpecialization(user.getSpecialization());
        dto.setSkills(user.getSkills());
        dto.setCurrentFocus(user.getCurrentFocus());
        dto.setPortfolioNotes(user.getPortfolioNotes());
        dto.setCompany(user.getCompany());
        dto.setDesignation(user.getDesignation());
        dto.setPriorities(user.getPriorities());
        dto.setDecisionNotes(user.getDecisionNotes());
        dto.setProfileImage(user.getProfileImage());
        dto.setDisplayName(user.getName());
        return dto;
    }

    private boolean matchesRole(User user, String roles) {
        String normalized = roles.toUpperCase();
        for (String roleValue : normalized.split(",")) {
            if (user.getRole() != null && user.getRole().name().equals(roleValue.trim())) {
                return true;
            }
        }
        return false;
    }
}
