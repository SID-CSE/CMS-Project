<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Session;
use App\Middleware\AuthMiddleware;
use App\Models\ProjectRequest;
use App\Models\ProjectTask;
use App\Repositories\TaskAttachmentRepository;
use App\Repositories\MessageRepository;
use App\Repositories\NotificationRepository;
use App\Repositories\ProjectRequestRepository;
use App\Repositories\ProjectTaskRepository;
use App\Repositories\UserRepository;

final class TaskWorkflowController extends Controller
{
    private const DASHBOARD_PATH = '/dashboard';
    private const ADMIN_PROJECTS_PATH = '/admin/projects';
    private const EDITOR_PROJECTS_PATH = '/editor/projects';
    private const PROJECT_SIGNED_OFF_TITLE = 'Project Signed Off';

    private ProjectRequestRepository $projects;
    private ProjectTaskRepository $tasks;
    private TaskAttachmentRepository $attachments;
    private NotificationRepository $notifications;
    private MessageRepository $messages;
    private UserRepository $users;

    public function __construct()
    {
        $this->projects = new ProjectRequestRepository();
        $this->tasks = new ProjectTaskRepository();
        $this->attachments = new TaskAttachmentRepository();
        $this->notifications = new NotificationRepository();
        $this->messages = new MessageRepository();
        $this->users = new UserRepository();
    }

    public function sendPlan(string $projectId): void
    {
        AuthMiddleware::requireAuth();
        if (!$this->isRole('ADMIN')) {
            $this->redirect(self::DASHBOARD_PATH);
        }

        $this->projects->updateStatus($projectId, ProjectRequest::STATUS_PLAN_SENT);
        $project = $this->projects->findById($projectId);
        if ($project !== null) {
            $stakeholder = $this->users->findById($project->clientId);
            if ($stakeholder !== null) {
                $this->pushWorkflowMessage(
                    (string) (Session::get('auth_user', [])['id'] ?? ''),
                    $stakeholder->id,
                    'Project Plan Ready',
                    'Your project plan for "' . $project->title . '" has been sent and is ready for review.',
                    $project->id
                );
            }
            $this->notifications->create(
                userId: $project->clientId,
                recipientEmail: null,
                recipientRole: 'STAKEHOLDER',
                title: 'Project Plan Ready',
                body: 'The admin has sent your project plan for "' . $project->title . '".',
                level: 'INFO',
                projectId: $project->id
            );
        }
        $this->redirect(self::ADMIN_PROJECTS_PATH);
    }

    public function assignTask(string $projectId): void
    {
        AuthMiddleware::requireAuth();
        if (!$this->isRole('ADMIN')) {
            $this->redirect(self::DASHBOARD_PATH);
        }

        $title = trim((string) ($_POST['title'] ?? ''));
        $description = trim((string) ($_POST['description'] ?? ''));
        $assigneeEmail = trim((string) ($_POST['assignee_email'] ?? ''));

        if ($title !== '' && $assigneeEmail !== '') {
            $this->tasks->create($projectId, $title, $description, $assigneeEmail);
            $this->projects->updateStatus($projectId, ProjectRequest::STATUS_IN_PROGRESS);
            $project = $this->projects->findById($projectId);
            $recipient = $this->users->findByEmail(strtolower($assigneeEmail));
            if ($project !== null && $recipient !== null) {
                $this->pushWorkflowMessage(
                    (string) (Session::get('auth_user', [])['id'] ?? ''),
                    $recipient->id,
                    'New Task Assigned',
                    'A new task "' . $title . '" has been assigned for project "' . $project->title . '".',
                    $project->id
                );
            }
            $this->notifications->create(
                userId: null,
                recipientEmail: strtolower($assigneeEmail),
                recipientRole: 'EDITOR',
                title: 'New Task Assigned',
                body: 'A new task "' . $title . '" has been assigned to you' . ($project !== null ? ' for project "' . $project->title . '".' : '.'),
                level: 'INFO',
                projectId: $projectId
            );
        }

        $this->redirect(self::ADMIN_PROJECTS_PATH);
    }

    public function submitTask(string $taskId): void
    {
        AuthMiddleware::requireAuth();
        if (!$this->isRole('EDITOR')) {
            $this->redirect(self::DASHBOARD_PATH);
        }

        $task = $this->tasks->findById($taskId);
        $email = strtolower((string) (Session::get('auth_user', [])['email'] ?? ''));

        if ($task !== null && $task->assigneeEmail === $email) {
            $submissionNote = trim((string) ($_POST['submission_note'] ?? ''));
            $this->tasks->markSubmitted($taskId, $submissionNote);
            $this->storeTaskAttachment($taskId);
            $this->refreshProjectDeliveryStatus($task->projectId);
            $admin = $this->users->findFirstByRole('ADMIN');
            if ($admin !== null) {
                $this->pushWorkflowMessage(
                    $task->assigneeEmail,
                    $admin->id,
                    'Task Submission',
                    'The task "' . $task->title . '" has been submitted' . ($submissionNote !== '' ? ":\n" . $submissionNote : '.') ,
                    $task->projectId
                );
            }
            $this->notifications->create(
                userId: null,
                recipientEmail: null,
                recipientRole: 'ADMIN',
                title: 'Task Submitted',
                body: 'Editor submission received for task "' . $task->title . '".',
                level: 'INFO',
                projectId: $task->projectId
            );
        }

        $this->redirect(self::EDITOR_PROJECTS_PATH);
    }

    public function approveTask(string $taskId): void
    {
        $this->reviewTask($taskId, true);
    }

    public function requestTaskRevision(string $taskId): void
    {
        $this->reviewTask($taskId, false);
    }

    public function stakeholderSignOff(string $projectId): void
    {
        AuthMiddleware::requireAuth();
        if (!$this->isRole('STAKEHOLDER')) {
            $this->redirect(self::DASHBOARD_PATH);
        }

        $project = $this->findOwnedProject($projectId);
        if ($project === null) {
            $this->redirect('/stakeholder/projects');
        }

        if ($project->status !== ProjectRequest::STATUS_DELIVERED) {
            Session::set('flash_error', 'Final sign-off is only available after delivery is completed.');
            $this->redirect('/stakeholder/projects/' . $projectId);
        }

        $ratingRaw = (string) ($_POST['rating'] ?? '');
        $rating = $ratingRaw === '' ? null : (int) $ratingRaw;
        $feedback = trim((string) ($_POST['feedback'] ?? ''));

        if ($rating !== null) {
            $rating = max(1, min(5, $rating));
        }

        $this->projects->markStakeholderSignOff($projectId, $rating, $feedback);
        $project = $this->projects->findById($projectId);
        if ($project !== null) {
            $admin = $this->users->findFirstByRole('ADMIN');
            if ($admin !== null) {
                $this->pushWorkflowMessage(
                    (string) (Session::get('auth_user', [])['id'] ?? ''),
                    $admin->id,
                    'Project Signed Off',
                    'Stakeholder sign-off was completed for "' . $project->title . '".' . ($feedback !== '' ? "\nFeedback: " . $feedback : ''),
                    $project->id
                );
            }
            $this->notifications->create(
                userId: null,
                recipientEmail: null,
                recipientRole: 'ADMIN',
                title: self::PROJECT_SIGNED_OFF_TITLE,
                body: 'Stakeholder completed sign-off for "' . $project->title . '".',
                level: 'SUCCESS',
                projectId: $project->id
            );
            $this->notifications->create(
                userId: null,
                recipientEmail: null,
                recipientRole: 'EDITOR',
                title: self::PROJECT_SIGNED_OFF_TITLE,
                body: 'Stakeholder approved final delivery for "' . $project->title . '".',
                level: 'SUCCESS',
                projectId: $project->id
            );
        }
        $this->redirect('/stakeholder/projects/' . $projectId);
    }

    private function reviewTask(string $taskId, bool $approved): void
    {
        AuthMiddleware::requireAuth();
        if (!$this->isRole('ADMIN')) {
            $this->redirect(self::DASHBOARD_PATH);
        }

        $task = $this->tasks->findById($taskId);
        if ($task === null) {
            $this->redirect(self::ADMIN_PROJECTS_PATH);
        }

        $reviewNote = trim((string) ($_POST['review_note'] ?? ''));
        if ($approved) {
            $this->tasks->markApproved($taskId, $reviewNote);
            $editor = $this->users->findByEmail($task->assigneeEmail);
            if ($editor !== null) {
                $this->pushWorkflowMessage(
                    (string) (Session::get('auth_user', [])['id'] ?? ''),
                    $editor->id,
                    'Task Approved',
                    'Your task "' . $task->title . '" has been approved by admin.',
                    $task->projectId
                );
            }
            $this->notifications->create(
                userId: null,
                recipientEmail: $task->assigneeEmail,
                recipientRole: 'EDITOR',
                title: 'Task Approved',
                body: 'Your task "' . $task->title . '" has been approved by admin.',
                level: 'SUCCESS',
                projectId: $task->projectId
            );
        } else {
            $this->tasks->requestRevision($taskId, $reviewNote);
            $this->projects->updateStatus($task->projectId, ProjectRequest::STATUS_REVISION);
            $editor = $this->users->findByEmail($task->assigneeEmail);
            if ($editor !== null) {
                $this->pushWorkflowMessage(
                    (string) (Session::get('auth_user', [])['id'] ?? ''),
                    $editor->id,
                    'Revision Requested',
                    'Please revise the task "' . $task->title . '".' . ($reviewNote !== '' ? "\nNote: " . $reviewNote : ''),
                    $task->projectId
                );
            }
            $this->notifications->create(
                userId: null,
                recipientEmail: $task->assigneeEmail,
                recipientRole: 'EDITOR',
                title: 'Revision Requested',
                body: 'Admin requested revision for task "' . $task->title . '".',
                level: 'WARNING',
                projectId: $task->projectId
            );
        }

        $this->refreshProjectDeliveryStatus($task->projectId);
        $this->redirect(self::ADMIN_PROJECTS_PATH);
    }

    private function refreshProjectDeliveryStatus(string $projectId): void
    {
        $approvedCount = $this->tasks->countForProjectByStatus($projectId, ProjectTask::STATUS_APPROVED);
        $assignedCount = $this->tasks->countForProjectByStatus($projectId, ProjectTask::STATUS_ASSIGNED);
        $submittedCount = $this->tasks->countForProjectByStatus($projectId, ProjectTask::STATUS_SUBMITTED);
        $revisionCount = $this->tasks->countForProjectByStatus($projectId, ProjectTask::STATUS_REVISION_REQUESTED);

        if ($approvedCount > 0 && ($assignedCount + $submittedCount + $revisionCount) === 0) {
            $this->projects->updateStatus($projectId, ProjectRequest::STATUS_DELIVERED);
            return;
        }

        if ($revisionCount > 0) {
            $this->projects->updateStatus($projectId, ProjectRequest::STATUS_REVISION);
            return;
        }

        if (($assignedCount + $submittedCount + $approvedCount) > 0) {
            $this->projects->updateStatus($projectId, ProjectRequest::STATUS_IN_PROGRESS);
        }
    }

    private function isRole(string $role): bool
    {
        $user = Session::get('auth_user', []);
        return strtoupper((string) ($user['role'] ?? '')) === $role;
    }

    private function pushWorkflowMessage(string $senderIdentifier, string $recipientIdentifier, string $subject, string $body, ?string $projectId = null): void
    {
        $senderId = $this->resolveUserId($senderIdentifier);
        $recipientId = $this->resolveUserId($recipientIdentifier);

        if ($senderId === null || $recipientId === null || $senderId === $recipientId) {
            return;
        }

        $thread = $this->messages->createThread($senderId, $recipientId, $subject, $projectId);
        $this->messages->sendMessage($thread->id, $senderId, $body);
    }

    private function storeTaskAttachment(string $taskId): void
    {
        $cloudPublicId = trim((string) ($_POST['cloud_public_id'] ?? ''));
        $cloudUrl = trim((string) ($_POST['cloud_secure_url'] ?? ''));
        if ($cloudPublicId !== '' && $cloudUrl !== '') {
            $originalName = trim((string) ($_POST['cloud_original_name'] ?? 'upload'));
            $storedName = trim((string) ($_POST['cloud_stored_name'] ?? $originalName));
            $mimeType = trim((string) ($_POST['cloud_mime_type'] ?? '')) ?: null;
            $resourceType = trim((string) ($_POST['cloud_resource_type'] ?? '')) ?: null;
            $fileType = trim((string) ($_POST['cloud_file_type'] ?? '')) ?: null;
            $streamUrl = trim((string) ($_POST['cloud_stream_url'] ?? $cloudUrl)) ?: $cloudUrl;

            $this->attachments->create(
                $taskId,
                $originalName !== '' ? $originalName : 'upload',
                $storedName !== '' ? $storedName : $originalName,
                $cloudUrl,
                $mimeType,
                'cloudinary',
                $cloudPublicId,
                $resourceType,
                $fileType,
                $streamUrl
            );
            return;
        }

        if (!isset($_FILES['attachment']) || !is_array($_FILES['attachment'])) {
            return;
        }

        $upload = $_FILES['attachment'];
        if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            return;
        }

        $originalName = basename((string) ($upload['name'] ?? 'attachment'));
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $safeBase = preg_replace('/[^A-Za-z0-9_-]+/', '_', pathinfo($originalName, PATHINFO_FILENAME));
        $storedName = $taskId . '_' . $safeBase . ($extension !== '' ? '.' . $extension : '');

        $uploadDir = __DIR__ . '/../../public/uploads/task-attachments';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $relativePath = '/uploads/task-attachments/' . $storedName;
        $absolutePath = $uploadDir . '/' . $storedName;

        if (move_uploaded_file((string) $upload['tmp_name'], $absolutePath)) {
            $this->attachments->create(
                $taskId,
                $originalName,
                $storedName,
                $relativePath,
                (string) ($upload['type'] ?? null),
                'local',
                null,
                null,
                $this->detectFileType((string) ($upload['type'] ?? ''), $originalName),
                $relativePath
            );
        }
    }

    private function detectFileType(string $mimeType, string $fileName): string
    {
        $mimeType = strtolower(trim($mimeType));
        if (str_starts_with($mimeType, 'video/')) {
            return 'VIDEO';
        }

        if (str_starts_with($mimeType, 'image/')) {
            return 'IMAGE';
        }

        $extension = strtolower((string) pathinfo($fileName, PATHINFO_EXTENSION));
        if ($mimeType === 'application/pdf' || $extension === 'pdf') {
            return 'PDF';
        }

        return 'FILE';
    }

    private function resolveUserId(string $identifier): ?string
    {
        $identifier = trim($identifier);
        if ($identifier === '') {
            return null;
        }

        $user = $this->users->findById($identifier);
        if ($user !== null) {
            return $user->id;
        }

        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $user = $this->users->findByEmail(strtolower($identifier));
            if ($user !== null) {
                return $user->id;
            }
        }

        return null;
    }

    private function findOwnedProject(string $projectId): ?ProjectRequest
    {
        $project = $this->projects->findById($projectId);
        $user = Session::get('auth_user', []);
        $userId = (string) ($user['id'] ?? '');

        if ($project === null || $userId === '' || $project->clientId !== $userId) {
            return null;
        }

        return $project;
    }
}
