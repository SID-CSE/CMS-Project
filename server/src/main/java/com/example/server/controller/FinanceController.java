package com.example.server.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.ApiResponse;
import com.example.server.dto.CreateFinanceRequestDTO;
import com.example.server.dto.DistributeFinanceRequestDTO;
import com.example.server.dto.FinanceDistributionDTO;
import com.example.server.dto.FinanceProjectDTO;
import com.example.server.dto.FinanceRequestDTO;
import com.example.server.service.FinanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/admin/finance/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FinanceProjectDTO>>> getAdminProjects(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Finance projects fetched successfully", financeService.getAdminProjects()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/admin/finance/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FinanceRequestDTO>>> getAdminRequests(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Finance requests fetched successfully", financeService.getAdminRequests(authentication.getName())));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PostMapping("/admin/projects/{projectId}/finance-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FinanceRequestDTO>> createRequest(
            @PathVariable String projectId,
            Authentication authentication,
            @Valid @RequestBody CreateFinanceRequestDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Finance request created successfully", financeService.createRequest(projectId, authentication.getName(), dto)));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PatchMapping("/admin/finance-requests/{requestId}/distribute")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FinanceRequestDTO>> distributeRequest(
            @PathVariable String requestId,
            Authentication authentication,
            @RequestBody(required = false) DistributeFinanceRequestDTO dto) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Finance distributed successfully", financeService.distributeRequest(requestId, authentication.getName(), dto)));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/stakeholder/finance/requests")
    @PreAuthorize("hasRole('STAKEHOLDER')")
    public ResponseEntity<ApiResponse<List<FinanceRequestDTO>>> getStakeholderRequests(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Finance requests fetched successfully", financeService.getStakeholderRequests(authentication.getName())));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PatchMapping("/stakeholder/finance-requests/{requestId}/pay")
    @PreAuthorize("hasRole('STAKEHOLDER')")
    public ResponseEntity<ApiResponse<FinanceRequestDTO>> markPaid(
            @PathVariable String requestId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", financeService.markRequestPaid(requestId, authentication.getName())));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/editor/finance/payouts")
    @PreAuthorize("hasRole('EDITOR')")
    public ResponseEntity<ApiResponse<List<FinanceDistributionDTO>>> getEditorPayouts(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Payouts fetched successfully", financeService.getEditorPayouts(authentication.getName())));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }
}