<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Session;
use App\Middleware\AuthMiddleware;
use App\Models\ProjectRequest;
use App\Repositories\ProjectRequestRepository;

final class ProjectController extends Controller
{
    private const PROJECT_NOT_FOUND = 'Project not found';
    private ProjectRequestRepository $projects;

    public function __construct()
    {
        $this->projects = new ProjectRequestRepository();
    }

    public function dashboard(): void
    {
        AuthMiddleware::requireAuth();
        $user = Session::get('auth_user');

        $this->render('projects/index', [
            'title' => 'Dashboard - Contify',
            'user' => $user,
            'projects' => $this->projects->findByClientId((string) $user['id']),
        ]);
    }

    public function createForm(): void
    {
        AuthMiddleware::requireAuth();
        $this->render('projects/create', ['title' => 'Create Project Request']);
    }

    public function create(): void
    {
        AuthMiddleware::requireAuth();
        $user = Session::get('auth_user');

        $title = trim((string) ($_POST['title'] ?? ''));
        $description = $this->buildStructuredDescription($_POST);
        $deadline = trim((string) ($_POST['deadline'] ?? ''));
        $contentTypesInput = (string) ($_POST['content_types'] ?? '');
        $contentTypes = array_filter(array_map('trim', explode(',', $contentTypesInput)));

        if ($title === '' || $description === '' || $deadline === '') {
            Session::set('flash_error', 'Title, description and deadline are required.');
            $this->redirect('/stakeholder/projects/create');
        }

        $project = $this->projects->create((string) $user['id'], $title, $description, $contentTypes, $deadline);
        $this->redirect('/stakeholder/projects/' . $project->id);
    }

    public function apiCreate(): void
    {
        AuthMiddleware::requireAuth();
        $user = Session::get('auth_user');

        $input = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($input)) {
            $input = $_POST;
        }

        $title = trim((string) ($input['title'] ?? ''));
        $description = $this->buildStructuredDescription($input);
        $deadline = trim((string) ($input['deadline'] ?? ''));
        $contentTypes = $input['contentTypes'] ?? $input['content_types'] ?? [];
        if (is_string($contentTypes)) {
            $contentTypes = array_filter(array_map('trim', explode(',', $contentTypes)));
        }

        if ($title === '' || $description === '' || $deadline === '') {
            $this->json(['ok' => false, 'message' => 'Title, description and deadline are required'], 422);
        }

        $project = $this->projects->create((string) $user['id'], $title, $description, (array) $contentTypes, $deadline);
        $this->json(['ok' => true, 'message' => 'Project request created successfully', 'project' => $this->serializeProject($project)], 201);
    }

    public function show(string $projectId): void
    {
        AuthMiddleware::requireAuth();
        $project = $this->findOwnedProject($projectId);

        if ($project === null) {
            http_response_code(404);
            echo self::PROJECT_NOT_FOUND;
            return;
        }

        $this->render('projects/show', [
            'title' => 'Project Details',
            'project' => $project,
        ]);
    }

    public function acceptPlan(string $projectId): void
    {
        AuthMiddleware::requireAuth();
        $project = $this->findOwnedProject($projectId);

        if ($project === null) {
            $this->json(['ok' => false, 'message' => self::PROJECT_NOT_FOUND], 404);
        }

        if ($project->status !== ProjectRequest::STATUS_PLAN_SENT) {
            $this->json(['ok' => false, 'message' => 'Plan cannot be accepted in the current project state'], 409);
        }

        $project = $this->projects->updateStatus($projectId, ProjectRequest::STATUS_IN_PROGRESS);

        if ($project === null) {
            $this->json(['ok' => false, 'message' => self::PROJECT_NOT_FOUND], 404);
        }

        $this->json(['ok' => true, 'message' => 'Plan accepted successfully', 'project' => $this->serializeProject($project)]);
    }

    public function requestChanges(string $projectId): void
    {
        AuthMiddleware::requireAuth();
        $project = $this->findOwnedProject($projectId);
        $feedback = trim((string) ($_POST['feedback'] ?? ''));

        if ($project === null) {
            $this->json(['ok' => false, 'message' => self::PROJECT_NOT_FOUND], 404);
        }

        if ($project->status !== ProjectRequest::STATUS_PLAN_SENT) {
            $this->json(['ok' => false, 'message' => 'Feedback can only be submitted after a plan is sent'], 409);
        }

        if ($feedback === '') {
            $this->json(['ok' => false, 'message' => 'Feedback is required'], 422);
        }

        $project = $this->projects->requestChanges($projectId, $feedback);
        if ($project === null) {
            $this->json(['ok' => false, 'message' => self::PROJECT_NOT_FOUND], 404);
        }

        $this->json(['ok' => true, 'message' => 'Feedback submitted successfully', 'project' => $this->serializeProject($project)]);
    }

    public function apiList(): void
    {
        AuthMiddleware::requireAuth();
        $user = Session::get('auth_user');

        $projects = $this->projects->findByClientId((string) $user['id']);
        $payload = array_map(fn (ProjectRequest $p): array => $this->serializeProject($p), $projects);
        $this->json(['ok' => true, 'projects' => $payload]);
    }

    public function apiShow(string $projectId): void
    {
        AuthMiddleware::requireAuth();
        $project = $this->findOwnedProject($projectId);

        if ($project === null) {
            $this->json(['ok' => false, 'message' => self::PROJECT_NOT_FOUND], 404);
        }

        $this->json(['ok' => true, 'project' => $this->serializeProject($project)]);
    }

    private function serializeProject(ProjectRequest $project): array
    {
        return [
            'id' => $project->id,
            'clientId' => $project->clientId,
            'title' => $project->title,
            'description' => $project->description,
            'contentTypes' => $project->contentTypes,
            'deadline' => $project->deadline,
            'status' => $project->status,
            'stakeholderRating' => $project->stakeholderRating,
            'stakeholderFeedback' => $project->stakeholderFeedback,
            'stakeholderReviewedAt' => $project->stakeholderReviewedAt,
            'createdAt' => $project->createdAt,
            'updatedAt' => $project->updatedAt,
        ];
    }

    private function buildStructuredDescription(array $input): string
    {
        $sections = [
            ['Project Summary', (string) ($input['projectSummary'] ?? $input['description'] ?? '')],
            ['Business Objective', (string) ($input['business_objective'] ?? $input['businessObjective'] ?? '')],
            ['Target Audience', (string) ($input['target_audience'] ?? $input['targetAudience'] ?? '')],
            ['Deliverables & Scope', (string) ($input['deliverables'] ?? '')],
            ['Success Metrics', (string) ($input['success_metrics'] ?? $input['successMetrics'] ?? '')],
            ['Brand/Tone Guidelines', (string) ($input['brand_tone'] ?? $input['brandTone'] ?? '')],
            ['References & Notes', (string) ($input['references'] ?? '')],
        ];

        $parts = [];
        foreach ($sections as [$heading, $value]) {
            $trimmed = trim($value);
            if ($trimmed !== '') {
                $parts[] = $heading . ":\n" . $trimmed;
            }
        }

        return implode("\n\n", $parts);
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
