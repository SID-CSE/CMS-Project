package com.example.server.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.ApiResponse;
import com.example.server.dto.MessageDTO;
import com.example.server.dto.MessageThreadDTO;
import com.example.server.dto.SendMessageDTO;
import com.example.server.service.MessageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<List<MessageThreadDTO>>> getInbox(Authentication authentication) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Inbox fetched successfully", messageService.getInbox(authentication.getName())));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getThread(
            Authentication authentication,
            @RequestParam String counterpartId,
            @RequestParam(required = false) String projectId) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Conversation fetched successfully", messageService.getThread(authentication.getName(), counterpartId, projectId)));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            Authentication authentication,
            @Valid @RequestBody SendMessageDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Message sent successfully", messageService.send(authentication.getName(), dto)));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PatchMapping("/threads/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            Authentication authentication,
            @RequestParam String counterpartId,
            @RequestParam(required = false) String projectId) {
        try {
            messageService.markThreadRead(authentication.getName(), counterpartId, projectId);
            return ResponseEntity.ok(ApiResponse.success("Conversation marked as read", null));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }
}