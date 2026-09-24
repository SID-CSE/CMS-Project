# Contify CMS - Backend API Documentation

## Overview
This is the Spring Boot backend for Contify, a full-stack Content Management System with a project request → plan → delivery workflow.

## Database Setup

### 1. Create MySQL Database
```sql
CREATE DATABASE Contify;
```

### 2. Update MySQL Credentials
In `application.properties`, update:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/Contify?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
```

### 3. Start the Server
```bash
mvn spring-boot:run
```

Tables will be created automatically via Hibernate (ddl-auto=update).

### 4. Test Data
On first run, 3 test users are created:
- **Stakeholder**: client@contify.com
- **Admin**: admin@contify.com  
- **Editor**: editor@contify.com

Check the console output for their IDs.

---

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
GET  /api/auth/verify-email?token={token}
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

New password registrations return `emailVerificationRequired=true` and no JWT until the verification link is used. Existing users with `email_verified IS NULL` remain eligible to log in. Google sign-in accepts a Google Identity Services ID token; Spring Boot verifies its audience and verified email before issuing a Contify JWT.

### Health Check
```
GET http://localhost:9090/
GET http://localhost:9090/health
GET http://localhost:9090/api/health
```

### STAGE 1 & 3: STAKEHOLDER ENDPOINTS

#### 1. Create Project Request
```
POST /api/projects/request?clientId={clientId}
Content-Type: application/json

{
  "title": "Website Redesign",
  "description": "Complete website redesign with new branding",
  "contentTypes": ["DESIGN", "COPY"],
  "deadline": "2026-05-30"
}

Response (201 Created):
{
  "success": true,
  "message": "Project request created successfully",
  "data": {
    "id": "uuid",
    "title": "Website Redesign",
    "description": "...",
    "contentTypes": ["DESIGN", "COPY"],
    "deadline": "2026-05-30",
    "status": "REQUESTED",
    "client": {
      "id": "clientId",
      "name": "John Client",
      "email": "client@contify.com",
      "role": "STAKEHOLDER"
    },
    "createdAt": "2026-04-06T10:30:00"
  }
}
```

#### 2. Get All Client Projects
```
GET /api/projects/client?clientId={clientId}

Response (200 OK):
{
  "success": true,
  "message": "Projects fetched successfully",
  "data": [
    { /* ProjectRequestResponseDTO */ }
  ]
}
```

#### 3. Get Single Project Detail
```
GET /api/projects/{projectId}?clientId={clientId}

Response (200 OK):
{
  "success": true,
  "message": "Project fetched successfully",
  "data": { /* ProjectRequestResponseDTO */ }
}
```

#### 4. Accept Plan
```
PATCH /api/projects/{projectId}/accept?clientId={clientId}

Response (200 OK):
{
  "success": true,
  "message": "Plan accepted successfully",
  "data": { /* ProjectRequestResponseDTO with status: IN_PROGRESS */ }
}
```

#### 5. Request Plan Changes
```
PATCH /api/projects/{projectId}/feedback?clientId={clientId}
Content-Type: application/json

{
  "feedback": "Please adjust the timeline and add more video content"
}

Response (200 OK):
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": { /* ProjectRequestResponseDTO */ }
}
```

---

### STAGE 2: ADMIN ENDPOINTS

#### 1. Get All New Requests
```
GET /api/admin/requests

Response (200 OK):
{
  "success": true,
  "message": "New requests fetched successfully",
  "data": [
    {
      "id": "projectId",
      "title": "Website Redesign",
      "description": "...",
      "contentTypes": ["DESIGN", "COPY"],
      "status": "REQUESTED",
      ...
    }
  ]
}
```

#### 2. Get Request Detail
```
GET /api/admin/requests/{projectId}

Response (200 OK):
{
  "success": true,
  "message": "Request detail fetched successfully",
  "data": { /* ProjectRequestResponseDTO */ }
}
```

#### 3. Create Project Plan
```
POST /api/admin/projects/{projectId}/plan?adminId={adminId}
Content-Type: application/json

{
  "timelineStart": "2026-04-10",
  "timelineEnd": "2026-05-30",
  "notes": "Comprehensive plan to deliver website redesign with 3 phases",
  "milestones": [
    {
      "title": "Design Phase",
      "dueDate": "2026-04-24",
      "orderIndex": 1
    },
    {
      "title": "Content Development",
      "dueDate": "2026-05-08",
      "orderIndex": 2
    },
    {
      "title": "Final Review & Delivery",
      "dueDate": "2026-05-30",
      "orderIndex": 3
    }
  ]
}

Response (201 Created):
{
  "success": true,
  "message": "Project plan created successfully",
  "data": {
    "id": "planId",
    "projectId": "projectId",
    "admin": {
      "id": "adminId",
      "name": "Alice Admin",
      "email": "admin@contify.com",
      "role": "ADMIN"
    },
    "timelineStart": "2026-04-10",
    "timelineEnd": "2026-05-30",
    "notes": "...",
    "milestones": [
      {
        "id": "milestoneId",
        "title": "Design Phase",
        "dueDate": "2026-04-24",
        "orderIndex": 1
      },
      ...
    ],
    "sentAt": null,
    "acceptedAt": null,
    "createdAt": "2026-04-06T10:35:00"
  }
}
```

#### 4. Send Plan to Client
```
PATCH /api/admin/projects/{projectId}/plan/send?adminId={adminId}

Response (200 OK):
{
  "success": true,
  "message": "Plan sent to client successfully",
  "data": {
    /* ProjectPlanResponseDTO with sentAt: timestamp */
  }
}
```

---

### NOTIFICATIONS ENDPOINTS

#### 1. Get User Notifications
```
GET /api/notifications?userId={userId}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "notificationId",
      "type": "NEW_REQUEST",
      "title": "New Project Request",
      "message": "New project request: Website Redesign",
      "relatedEntityId": "projectId",
      "isRead": false,
      "createdAt": "2026-04-06T10:30:00"
    }
  ],
  "unreadCount": 3
}
```

#### 2. Get Unread Notifications
```
GET /api/notifications/unread?userId={userId}

Response (200 OK):
{
  "success": true,
  "data": [ /* Unread notifications only */ ],
  "count": 3
}
```

#### 3. Mark Notification as Read
```
PATCH /api/notifications/{notificationId}/read

Response (200 OK):
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### 4. Mark All Notifications as Read
```
PATCH /api/notifications/read-all?userId={userId}

Response (200 OK):
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Project Workflow States

### ProjectRequest Status Flow
1. **REQUESTED** - Stakeholder creates request, admins notified
2. **PLAN_SENT** - Admin creates & sends plan to client
3. **IN_PROGRESS** - Client accepts plan, tasks created
4. **DELIVERED** - All tasks approved
5. **REVISION** - Client requests changes

---

## Testing Flow

### Complete Workflow Test
1. **Get test user IDs** from console output on startup
2. **POST** stakeholder project request
3. **GET** admin requests dashboard
4. **POST** admin creates plan with milestones
5. **PATCH** admin sends plan to client
6. **GET** notifications for stakeholder and admin
7. **PATCH** stakeholder accepts plan
8. **GET** updated project status

---

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2026-04-06T10:30:00"
}
```

### Common Errors
- `400 Bad Request` - Validation failed or invalid input
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Invalid status transition
- `500 Internal Server Error` - Unexpected server error

---

## Project Structure
```
src/main/java/com/example/server/
├── entity/          # JPA Entity classes
├── repository/      # Spring Data JPA repositories
├── service/         # Business logic layer
├── controller/      # REST API endpoints
├── dto/             # Data Transfer Objects
├── config/          # Spring configuration
└── exception/       # Exception handling
```

---

## Key Notes

1. All IDs are UUIDs (not auto-increment)
2. Timestamps are stored in UTC
3. Notifications are created automatically on status changes
4. Cross-Origin (CORS) enabled for localhost:5173 and :3000
5. Request/Response validation using Jakarta
