package com.example.server.controller;

import com.example.server.dto.*;
import com.example.server.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editor")
public class EditorTaskController {

    private final ProjectService projectService;

    public EditorTaskController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponseDTO>>> getEditorTasks(@RequestParam String editorId) {
        try {
            List<TaskResponseDTO> tasks = projectService.getEditorTasks(editorId);
            return ResponseEntity.ok(ApiResponse.success("Editor tasks fetched successfully", tasks));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== STAGE 5: EDITOR SUBMITS WORK =====
    @PostMapping("/tasks/{taskId}/submit")
    public ResponseEntity<ApiResponse<TaskResponseDTO>> submitTask(
            @PathVariable String taskId,
            @RequestParam String editorId,
            @Valid @RequestBody SubmitTaskDTO dto) {
        try {
            TaskResponseDTO result = projectService.submitTask(taskId, editorId, dto);
            return ResponseEntity.ok(ApiResponse.success("Task submitted successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
