package com.example.server.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.ApiResponse;
import com.example.server.dto.TaskStreamUrlResponseDTO;
import com.example.server.service.ProjectService;

@RestController
@RequestMapping({"/api/stakeholder/tasks", "/api/client/tasks"})
public class ClientTaskController {

    private final ProjectService projectService;

    public ClientTaskController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/{taskId}/stream-url")
    @PreAuthorize("hasRole('STAKEHOLDER')")
    public ResponseEntity<ApiResponse<TaskStreamUrlResponseDTO>> getStreamUrl(
            @PathVariable String taskId,
            Authentication authentication) {
        try {
            TaskStreamUrlResponseDTO response = projectService.getStakeholderStreamUrl(taskId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Signed stream URL generated", response));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }
}