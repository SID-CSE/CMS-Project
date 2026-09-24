package com.example.server.controller;

import java.util.List;

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
import com.example.server.dto.CreateProjectRequestDTO;
import com.example.server.dto.ProjectCompletionFeedbackDTO;
import com.example.server.dto.ProjectPlanResponseDTO;
import com.example.server.dto.ProjectRequestResponseDTO;
import com.example.server.dto.RequestChangesDTO;
import com.example.server.dto.StakeholderTaskReviewDTO;
import com.example.server.dto.TaskResponseDTO;
import com.example.server.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects")
@Validated
public class ProjectRequestController {

    private static final Logger log = LoggerFactory.getLogger(ProjectRequestController.class);

    private final ProjectService projectService;

    // Constructor
    public ProjectRequestController(ProjectService projectService) {
        this.projectService = projectService;
    }

    private String resolveStakeholderId(String stakeholderId, String clientId) {
        return stakeholderId != null ? stakeholderId : clientId;
    }

    // ===== STAGE 1: STAKEHOLDER CREATES PROJECT REQUEST =====
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<ProjectRequestResponseDTO>> createProjectRequest(
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId,
            @Valid @RequestBody CreateProjectRequestDTO dto) {
        String resolvedStakeholderId = resolveStakeholderId(stakeholderId, clientId);
        
        log.info("POST /api/projects/request - Creating project request for stakeholder: {}", resolvedStakeholderId);
        try {
            ProjectRequestResponseDTO result = projectService.createProjectRequest(resolvedStakeholderId, dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Project request created successfully", result));
        } catch (Exception e) {
            log.error("Error creating project request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAKEHOLDER: LIST ALL THEIR PROJECTS =====
    @GetMapping({"/stakeholder", "/client"})
    public ResponseEntity<ApiResponse<List<ProjectRequestResponseDTO>>> getClientProjects(
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId) {
        String resolvedStakeholderId = resolveStakeholderId(stakeholderId, clientId);
        
        log.info("GET /api/projects/stakeholder - Fetching projects for stakeholder: {}", resolvedStakeholderId);
        try {
            List<ProjectRequestResponseDTO> projects = projectService.getClientProjects(resolvedStakeholderId);
            return ResponseEntity.ok(ApiResponse.success("Projects fetched successfully", projects));
        } catch (Exception e) {
            log.error("Error fetching stakeholder projects: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAKEHOLDER: GET SINGLE PROJECT DETAIL =====
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectRequestResponseDTO>> getProject(
            @PathVariable String projectId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId) {
        String resolvedStakeholderId = resolveStakeholderId(stakeholderId, clientId);
        
        log.info("GET /api/projects/{} - Fetching project detail for stakeholder: {}", projectId, resolvedStakeholderId);
        try {
            ProjectRequestResponseDTO project = projectService.getProjectForClient(projectId, resolvedStakeholderId);
            return ResponseEntity.ok(ApiResponse.success("Project fetched successfully", project));
        } catch (Exception e) {
            log.error("Error fetching project: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAGE 2: STAKEHOLDER ACCEPTS PLAN =====
    @PatchMapping("/{projectId}/accept")
    public ResponseEntity<ApiResponse<ProjectRequestResponseDTO>> acceptPlan(
            @PathVariable String projectId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId) {
        String resolvedStakeholderId = resolveStakeholderId(stakeholderId, clientId);
        
        log.info("PATCH /api/projects/{}/accept - Stakeholder {} accepting plan", projectId, resolvedStakeholderId);
        try {
            ProjectRequestResponseDTO result = projectService.acceptPlan(projectId, resolvedStakeholderId);
            return ResponseEntity.ok(ApiResponse.success("Plan accepted successfully", result));
        } catch (Exception e) {
            log.error("Error accepting plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAGE 3: STAKEHOLDER REQUESTS CHANGES =====
    @PatchMapping("/{projectId}/feedback")
    public ResponseEntity<ApiResponse<ProjectRequestResponseDTO>> requestChanges(
            @PathVariable String projectId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId,
            @Valid @RequestBody RequestChangesDTO dto) {
        String resolvedStakeholderId = resolveStakeholderId(stakeholderId, clientId);
        
        log.info("PATCH /api/projects/{}/feedback - Stakeholder {} requesting changes", projectId, resolvedStakeholderId);
        try {
            ProjectRequestResponseDTO result = projectService.requestPlanChanges(projectId, resolvedStakeholderId, dto);
            return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", result));
        } catch (Exception e) {
            log.error("Error submitting feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAKEHOLDER: GET PROJECT PLAN =====
    @GetMapping("/{projectId}/plan")
    public ResponseEntity<ApiResponse<ProjectPlanResponseDTO>> getProjectPlan(
            @PathVariable String projectId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId) {
        try {
            ProjectPlanResponseDTO plan = projectService.getProjectPlan(projectId, resolveStakeholderId(stakeholderId, clientId));
            return ResponseEntity.ok(ApiResponse.success("Plan fetched successfully", plan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAKEHOLDER: GET PROJECT TASKS =====
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponseDTO>>> getProjectTasks(
            @PathVariable String projectId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId) {
        String resolvedStakeholderId = resolveStakeholderId(stakeholderId, clientId);
        try {
            ProjectRequestResponseDTO project = projectService.getProjectForClient(projectId, resolvedStakeholderId);
            if (project == null) {
                throw new RuntimeException("Project not found");
            }

            List<TaskResponseDTO> tasks = projectService.getProjectTasks(projectId);
            return ResponseEntity.ok(ApiResponse.success("Tasks fetched successfully", tasks));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/tasks/{taskId}/review")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> reviewTask(
            @PathVariable String taskId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId,
            @Valid @RequestBody StakeholderTaskReviewDTO dto) {
        try {
            TaskResponseDTO result = projectService.reviewTaskByStakeholder(taskId, resolveStakeholderId(stakeholderId, clientId), dto);
            return ResponseEntity.ok(ApiResponse.success("Task feedback submitted successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAGE 7: STAKEHOLDER SIGNS OFF DELIVERY =====
    @PatchMapping("/{projectId}/signoff")
    public ResponseEntity<ApiResponse<ProjectRequestResponseDTO>> signOffDelivery(
            @PathVariable String projectId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String clientId,
            @Valid @RequestBody ProjectCompletionFeedbackDTO dto) {
        try {
            ProjectRequestResponseDTO result = projectService.signOffDelivery(projectId, resolveStakeholderId(stakeholderId, clientId), dto);
            return ResponseEntity.ok(ApiResponse.success("Project signed off successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
