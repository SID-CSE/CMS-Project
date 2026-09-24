package com.example.server.controller;

import com.example.server.entity.Notification;
import com.example.server.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;

    // Constructor
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserNotifications(@RequestParam String userId) {
        log.info("GET /api/notifications - Fetching notifications for user: {}", userId);
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            long unreadCount = notificationService.getUnreadCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", notifications);
            response.put("unreadCount", unreadCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching notifications: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications(@RequestParam String userId) {
        log.info("GET /api/notifications/unread - Fetching unread notifications for user: {}", userId);
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", notifications);
            response.put("count", notifications.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching unread notifications: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable String notificationId) {
        log.info("PATCH /api/notifications/{}/read - Marking notification as read", notificationId);
        try {
            notificationService.markAsRead(notificationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification marked as read");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@RequestParam String userId) {
        log.info("PATCH /api/notifications/read-all - Marking all notifications as read for user: {}", userId);
        try {
            notificationService.markAllAsRead(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All notifications marked as read");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking all notifications as read: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
