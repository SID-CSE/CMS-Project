package com.example.server.controller;

import com.example.server.dto.ApiResponse;
import com.example.server.dto.TaskResponseDTO;
import com.example.server.dto.TaskSubmissionSummaryDTO;
import com.example.server.dto.TaskStreamUrlResponseDTO;
import com.example.server.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tasks")
public class AdminTaskController {

    private final ProjectService projectService;

    public AdminTaskController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<TaskResponseDTO>>> listTasks(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Tasks fetched successfully", projectService.getAllAdminTasks()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/{taskId}/submissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<TaskSubmissionSummaryDTO>>> listSubmissions(
            @PathVariable String taskId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Submissions fetched successfully", projectService.getTaskSubmissions(taskId)));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/submissions/{submissionId}/media-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaskStreamUrlResponseDTO>> getSubmissionMediaUrl(
            @PathVariable String submissionId,
            Authentication authentication) {
        try {
            TaskStreamUrlResponseDTO response = projectService.getAdminSubmissionMediaUrl(submissionId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Media URL generated", response));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/{taskId}/stream-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaskStreamUrlResponseDTO>> getStreamUrl(
            @PathVariable String taskId,
            Authentication authentication) {
        try {
            TaskStreamUrlResponseDTO response = projectService.getAdminStreamUrl(taskId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Signed stream URL generated", response));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PatchMapping("/{taskId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> approveTask(
            @PathVariable String taskId,
            Authentication authentication) {
        try {
            TaskResponseDTO response = projectService.approveTask(taskId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Task approved successfully", response));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PatchMapping("/{taskId}/hold")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> holdTask(
            @PathVariable String taskId,
            Authentication authentication) {
        try {
            TaskResponseDTO response = projectService.holdTask(taskId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Task placed on hold", response));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PatchMapping("/{taskId}/forward")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> forwardTask(
            @PathVariable String taskId,
            Authentication authentication) {
        try {
            TaskResponseDTO response = projectService.forwardTaskToStakeholder(taskId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Task forwarded to stakeholder", response));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }
}