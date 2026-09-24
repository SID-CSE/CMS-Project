package com.example.server.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.ApiResponse;
import com.example.server.dto.CreateProjectPlanDTO;
import com.example.server.dto.CreateTaskDTO;
import com.example.server.dto.ProjectPlanResponseDTO;
import com.example.server.dto.ProjectRequestResponseDTO;
import com.example.server.dto.ReviewTaskSubmissionDTO;
import com.example.server.dto.TaskResponseDTO;
import com.example.server.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminProjectController {

    private static final Logger log = LoggerFactory.getLogger(AdminProjectController.class);

    private final ProjectService projectService;

    // Constructor
    public AdminProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // ===== ADMIN: GET ALL NEW REQUESTS =====
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<ProjectRequestResponseDTO>>> getNewRequests() {
        log.info("GET /api/admin/requests - Fetching all new project requests");
        try {
            List<ProjectRequestResponseDTO> requests = projectService.getNewRequests();
            return ResponseEntity.ok(ApiResponse.success("New requests fetched successfully", requests));
        } catch (Exception e) {
            log.error("Error fetching new requests: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== ADMIN: GET SINGLE REQUEST DETAIL =====
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectRequestResponseDTO>> getProjectDetail(
            @PathVariable String projectId) {
        
        log.info("GET /api/admin/projects/{} - Fetching project detail", projectId);
        try {
            ProjectRequestResponseDTO request = projectService.getProjectForClient(projectId, null);
            return ResponseEntity.ok(ApiResponse.success("Request detail fetched successfully", request));
        } catch (Exception e) {
            log.error("Error fetching request detail: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== ADMIN: CREATE PROJECT PLAN =====
    @PostMapping("/projects/{projectId}/plan")
    public ResponseEntity<ApiResponse<ProjectPlanResponseDTO>> createProjectPlan(
            @PathVariable String projectId,
            @RequestParam String adminId,
            @Valid @RequestBody CreateProjectPlanDTO dto) {
        
        log.info("POST /api/admin/projects/{}/plan - Creating plan by admin: {}", projectId, adminId);
        try {
            ProjectPlanResponseDTO result = projectService.createProjectPlan(projectId, adminId, dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Project plan created successfully", result));
        } catch (Exception e) {
            log.error("Error creating project plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== ADMIN: SEND PLAN TO STAKEHOLDER =====
    @PatchMapping("/projects/{projectId}/plan/send")
    public ResponseEntity<ApiResponse<ProjectPlanResponseDTO>> sendPlanToClient(
            @PathVariable String projectId,
            @RequestParam String adminId) {
        
        log.info("PATCH /api/admin/projects/{}/plan/send - Sending plan to stakeholder by admin: {}", projectId, adminId);
        try {
            ProjectPlanResponseDTO result = projectService.sendPlanToClient(projectId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Plan sent to stakeholder successfully", result));
        } catch (Exception e) {
            log.error("Error sending plan to stakeholder: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAGE 4: ADMIN CREATES TASK =====
    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> createTask(
            @PathVariable String projectId,
            @RequestParam String adminId,
            @Valid @RequestBody CreateTaskDTO dto) {
        try {
            TaskResponseDTO result = projectService.createTask(projectId, adminId, dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Task created successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponseDTO>>> getProjectTasks(@PathVariable String projectId) {
        try {
            List<TaskResponseDTO> tasks = projectService.getProjectTasks(projectId);
            return ResponseEntity.ok(ApiResponse.success("Project tasks fetched successfully", tasks));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAGE 6: ADMIN REVIEWS SUBMISSION =====
    @PatchMapping("/tasks/{taskId}/review")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> reviewTask(
            @PathVariable String taskId,
            @RequestParam String adminId,
            @Valid @RequestBody ReviewTaskSubmissionDTO dto) {
        try {
            TaskResponseDTO result = projectService.reviewTask(taskId, adminId, dto);
            return ResponseEntity.ok(ApiResponse.success("Task review updated", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== ADMIN: UPDATE PROJECT STATUS =====
    @PatchMapping("/projects/{projectId}/status")
    public ResponseEntity<ApiResponse<ProjectRequestResponseDTO>> updateProjectStatus(
            @PathVariable String projectId,
            @RequestParam String adminId,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        try {
            ProjectRequestResponseDTO result = projectService.updateProjectStatus(projectId, newStatus, adminId);
            return ResponseEntity.ok(ApiResponse.success("Project status updated successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== ADMIN: GET ALL PROJECTS =====
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectRequestResponseDTO>>> getAllProjects() {
        try {
            List<ProjectRequestResponseDTO> projects = projectService.getAllProjects();
            return ResponseEntity.ok(ApiResponse.success("Projects fetched successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
