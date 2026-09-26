const LOCAL_MEDIA_URLS = Array.from({ length: 8 }, (_, index) => `/demo/task-${String(index + 1).padStart(2, "0")}-${["hero", "moodboard", "dashboard", "social", "mobile", "email", "analytics", "delivery"][index]}.svg`);
const configuredMediaUrls = (import.meta.env.VITE_DEMO_MEDIA_URLS || "").split(",").map((url) => url.trim()).filter(Boolean);
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const cloudMediaUrls = cloudName && cloudName !== "your_cloudinary_cloud_name"
  ? ["hero", "moodboard", "dashboard", "social", "mobile", "email", "analytics", "delivery"].map((name, index) => `https://res.cloudinary.com/${cloudName}/image/upload/contify-demo/task-${String(index + 1).padStart(2, "0")}-${name}.svg`)
  : [];
const SAMPLE_MEDIA_URLS = configuredMediaUrls.length === 8 ? configuredMediaUrls : cloudMediaUrls.length === 8 ? cloudMediaUrls : LOCAL_MEDIA_URLS;

export const demoProjects = [
  {
    id: "demo-project-1",
    title: "Website Redesign",
    description: "A conversion-focused redesign for a growing technology brand.",
    contentTypes: ["VIDEO", "IMAGE", "COPY"],
    deadline: "2026-10-24",
    status: "IN_PROGRESS",
    stakeholderId: "demo-stakeholder",
    clientId: "demo-stakeholder",
  },
  {
    id: "demo-project-2",
    title: "Product Launch Campaign",
    description: "Launch assets across social, email, and landing-page channels.",
    contentTypes: ["VIDEO", "DESIGN", "COPY"],
    deadline: "2026-11-08",
    status: "PLAN_SENT",
    stakeholderId: "demo-stakeholder",
    clientId: "demo-stakeholder",
  },
];

export const demoRequests = [
  {
    id: "demo-request-1",
    title: "Product Launch Campaign",
    description: "Create a coordinated launch package for the autumn release.",
    contentTypes: ["VIDEO", "DESIGN", "COPY"],
    deadline: "2026-11-08",
    status: "REQUESTED",
    stakeholderName: "Maya Chen",
  },
];

export const demoTasks = [
  {
    id: "demo-task-1",
    projectId: "demo-project-1",
    projectTitle: "Website Redesign",
    projectStatus: "IN_PROGRESS",
    title: "Landing page hero video",
    description: "A 30-second product story for the new homepage hero.",
    contentType: "VIDEO",
    status: "SUBMITTED",
    deadline: "2026-10-12",
    assignedEditor: { id: "demo-editor", name: "Jordan Patel", username: "jordan", role: "EDITOR" },
    latestSubmission: {
      id: "demo-submission-1",
      versionNumber: 3,
      cdnUrl: SAMPLE_MEDIA_URLS[0],
      streamUrl: SAMPLE_MEDIA_URLS[0],
      fileType: "IMAGE",
      adminReviewNote: "Strong pacing and clear product narrative.",
    },
  },
  {
    id: "demo-task-2",
    projectId: "demo-project-1",
    projectTitle: "Website Redesign",
    projectStatus: "IN_PROGRESS",
    title: "Brand moodboard",
    description: "Visual direction for the redesigned brand system.",
    contentType: "IMAGE",
    status: "APPROVED",
    deadline: "2026-10-08",
    assignedEditor: { id: "demo-editor", name: "Jordan Patel", username: "jordan", role: "EDITOR" },
    latestSubmission: {
      id: "demo-submission-2",
      versionNumber: 2,
      cdnUrl: SAMPLE_MEDIA_URLS[1],
      streamUrl: SAMPLE_MEDIA_URLS[1],
      fileType: "IMAGE",
    },
  },
  {
    id: "demo-task-3",
    projectId: "demo-project-2",
    projectTitle: "Product Launch Campaign",
    projectStatus: "PLAN_SENT",
    title: "Launch announcement copy",
    description: "Announcement copy for the launch email and social posts.",
    contentType: "COPY",
    status: "ASSIGNED",
    deadline: "2026-10-30",
    assignedEditor: { id: "demo-editor", name: "Jordan Patel", username: "jordan", role: "EDITOR" },
  },
  {
    id: "demo-task-4",
    projectId: "demo-project-2",
    projectTitle: "Product Launch Campaign",
    projectStatus: "PLAN_SENT",
    title: "Feature walkthrough reel",
    description: "Short-form vertical video showing the three core product moments.",
    contentType: "VIDEO",
    status: "NEEDS_REVISION",
    deadline: "2026-11-02",
    assignedEditor: { id: "demo-editor", name: "Jordan Patel", username: "jordan", role: "EDITOR" },
    latestSubmission: {
      id: "demo-submission-4",
      versionNumber: 1,
      cdnUrl: SAMPLE_MEDIA_URLS[3],
      streamUrl: SAMPLE_MEDIA_URLS[3],
      fileType: "IMAGE",
      adminReviewNote: "Please tighten the opening three seconds.",
    },
  },
  ...[2, 4, 5, 6].map((mediaIndex, offset) => ({
    id: `demo-task-${offset + 5}`,
    projectId: "demo-project-2",
    projectTitle: "Product Launch Campaign",
    projectStatus: "PLAN_SENT",
    title: ["Product dashboard snapshot", "Mobile product experience", "Launch email creative", "Campaign performance report"][offset],
    description: "A sample campaign asset prepared for recruiter demo review.",
    contentType: "IMAGE",
    status: offset === 0 ? "APPROVED" : "SUBMITTED",
    deadline: "2026-11-04",
    assignedEditor: { id: "demo-editor", name: "Jordan Patel", username: "jordan", role: "EDITOR" },
    latestSubmission: {
      id: `demo-submission-${offset + 5}`,
      versionNumber: offset + 1,
      cdnUrl: SAMPLE_MEDIA_URLS[mediaIndex],
      streamUrl: SAMPLE_MEDIA_URLS[mediaIndex],
      fileType: "IMAGE",
    },
  })),
];

export const demoPlan = {
  id: "demo-plan-1",
  timelineStart: "2026-10-01",
  timelineEnd: "2026-10-24",
  notes: "Keep the visual system confident, accessible, and easy to reuse across campaign surfaces.",
  milestones: [
    { id: "demo-milestone-1", title: "Kickoff and creative direction", dueDate: "2026-10-03", orderIndex: 1 },
    { id: "demo-milestone-2", title: "First content review", dueDate: "2026-10-12", orderIndex: 2 },
    { id: "demo-milestone-3", title: "Final delivery", dueDate: "2026-10-24", orderIndex: 3 },
  ],
};

export const demoUsers = [
  { id: "demo-editor", name: "Jordan Patel", displayName: "Jordan Patel", firstName: "Jordan", lastName: "Patel", username: "jordan", email: "jordan@contify.demo", role: "EDITOR", team: "Creative Studio", location: "Bengaluru", specialization: "Motion design", currentFocus: "Product storytelling" },
  { id: "demo-stakeholder", name: "Maya Chen", displayName: "Maya Chen", firstName: "Maya", lastName: "Chen", username: "maya", email: "maya@contify.demo", role: "STAKEHOLDER", company: "Northstar Labs", designation: "Marketing Director", location: "Singapore" },
];

export const demoNotifications = [
  { id: "demo-note-1", type: "SUBMISSION", title: "New submission ready", message: "Jordan submitted Landing page hero video for review.", relatedEntityId: "demo-task-1", createdAt: "2026-09-25T10:30:00Z", read: false },
  { id: "demo-note-2", type: "APPROVAL", title: "Moodboard approved", message: "The Brand moodboard was approved for Website Redesign.", relatedEntityId: "demo-task-2", createdAt: "2026-09-24T14:15:00Z", read: true },
  { id: "demo-note-3", type: "REVISION", title: "Revision requested", message: "A revision was requested for Feature walkthrough reel.", relatedEntityId: "demo-task-4", createdAt: "2026-09-23T09:45:00Z", read: false },
];

export const demoContacts = demoUsers;

export const demoThreads = [
  { counterpartId: "demo-editor", counterpart: demoUsers[0], projectId: "demo-project-1", projectTitle: "Website Redesign", lastMessage: "The revised hero cut is ready for review.", lastMessageAt: "2026-09-25T10:30:00Z", unreadCount: 2 },
  { counterpartId: "demo-stakeholder", counterpart: demoUsers[1], projectId: "demo-project-2", projectTitle: "Product Launch Campaign", lastMessage: "The campaign timeline looks good from our side.", lastMessageAt: "2026-09-24T16:20:00Z", unreadCount: 0 },
];

export const demoMessages = [
  { id: "demo-message-1", senderId: "demo-editor", senderName: "Jordan Patel", recipientId: "demo-user", body: "The revised hero cut is ready for review.", createdAt: "2026-09-25T10:30:00Z", read: false },
  { id: "demo-message-2", senderId: "demo-user", senderName: "Demo Visitor", recipientId: "demo-editor", body: "Great, I will review the pacing and CTA.", createdAt: "2026-09-25T10:35:00Z", read: true },
];

export const demoStakeholderMessages = [
  { id: "demo-message-3", senderId: "demo-stakeholder", senderName: "Maya Chen", recipientId: "demo-user", body: "The launch timeline looks good from our side.", createdAt: "2026-09-24T16:20:00Z", read: true },
  { id: "demo-message-4", senderId: "demo-user", senderName: "Demo Visitor", recipientId: "demo-stakeholder", body: "Perfect. The approved moodboard is now linked to the project delivery.", createdAt: "2026-09-24T16:26:00Z", read: true },
];

export const demoFinanceRequests = [
  { id: "demo-finance-1", projectId: "demo-project-1", projectTitle: "Website Redesign", totalAmount: 85000, companyProfitAmount: 17000, workerPoolAmount: 68000, stakeholderName: "Maya Chen", status: "PAID", createdAt: "2026-09-10T09:00:00Z", paidAt: "2026-09-12T11:00:00Z", note: "October delivery milestone" },
  { id: "demo-finance-2", projectId: "demo-project-2", projectTitle: "Product Launch Campaign", totalAmount: 120000, companyProfitAmount: 24000, workerPoolAmount: 96000, stakeholderName: "Maya Chen", status: "SENT", createdAt: "2026-09-20T09:00:00Z", note: "Launch campaign production" },
];

export function demoResponse(endpoint) {
  if (endpoint.includes("/editor/tasks") || endpoint === "/admin/tasks" || endpoint.includes("/admin/projects/") && endpoint.endsWith("/tasks") || endpoint.includes("/projects/demo-project-1/tasks") || endpoint.includes("/projects/demo-project-2/tasks")) return { data: demoTasks };
  if (endpoint.includes("/admin/tasks/") && endpoint.endsWith("/submissions")) return { data: demoTasks.flatMap((task) => task.latestSubmission ? [task.latestSubmission] : []) };
  if (endpoint.includes("/stream-url") || endpoint.includes("/media-url")) return { data: { streamUrl: SAMPLE_MEDIA_URLS[0], expiresAt: "demo session" } };
  if (endpoint === "/admin/projects" || endpoint === "/projects") return { data: demoProjects };
  if (endpoint.includes("/projects/stakeholder")) return { data: demoProjects };
  if (endpoint.includes("/admin/requests")) return { data: demoRequests };
  if (endpoint.includes("/plan")) return { data: demoPlan };
  if (endpoint.includes("/admin/projects/demo-project") || endpoint.includes("/projects/demo-project")) return { data: demoProjects[0] };
  if (endpoint.includes("/users/editors") || endpoint.includes("/team/editors/profiles")) return { data: demoUsers.filter((user) => user.role === "EDITOR") };
  if (endpoint.includes("/users/contacts")) return { data: demoContacts };
  if (endpoint.includes("/users/me") || endpoint.includes("/users/demo-")) return { data: demoUsers[0] };
  if (endpoint.includes("/messages/threads") && endpoint.includes("demo-stakeholder")) return { data: demoStakeholderMessages };
  if (endpoint.includes("/messages/threads")) return { data: demoMessages };
  if (endpoint.includes("/messages/inbox")) return { data: demoThreads };
  if (endpoint.includes("/notifications")) return { data: demoNotifications };
  if (endpoint.includes("/finance/requests") || endpoint.includes("/finance/projects")) return { data: demoFinanceRequests };
  if (endpoint.includes("/finance/payouts")) return { data: [{ id: "demo-payout-1", amount: 68000, recipientName: "Jordan Patel", recipientType: "EDITOR", status: "PAID", createdAt: "2026-09-12T11:00:00Z", paidAt: "2026-09-12T11:00:00Z" }] };
  if (endpoint.includes("/finance/cycle")) return { data: { periods: [{ id: "demo-cycle-1", label: "October 2026", status: "open" }], currentPeriod: { id: "demo-cycle-1", label: "October 2026" }, status: "active" } };
  if (endpoint.includes("/dashboard") || endpoint.includes("/analytics")) return { data: [] };
  return { data: [] };
}
