import { Navigate, Routes, Route } from "react-router-dom";

// Public Pages
import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import RoleSelection from "../pages/public/RoleSelection";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import GuestDemo from "../pages/public/GuestDemo";
import VerifyEmail from "../pages/public/VerifyEmail";

// Editor
import EditorDashboard from "../pages/editor/EditorDashboard";
import MyContent from "../pages/editor/MyContent";
import EditorMessages from "../pages/editor/EditorMessages";
import EditorProfile from "../pages/editor/EditorProfile";
import EditorProfileEdit from "../pages/editor/EditorProfileEdit";
import EditorFinance from "../pages/editor/EditorFinance";
import EditorProjects from "../pages/editor/EditorProjects";
import EditorProjectContent from "../pages/editor/EditorProjectContent";
import EditorContentViewer from "../pages/editor/EditorContentViewer";
import EditorVersionHistory from "../pages/editor/EditorVersionHistory";
import EditorNotifications from "../pages/editor/EditorNotifications";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import AdminMessages from "../pages/admin/AdminMessages";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminProfileEdit from "../pages/admin/AdminProfileEdit";
import AdminFinance from "../pages/admin/AdminFinance";
import AdminContent from "../pages/admin/AdminContent";
import AdminProjects from "../pages/admin/AdminProjects";
import AdminProjectDetail from "../pages/admin/AdminProjectDetail";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminAuditLog from "../pages/admin/AdminAuditLog";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminStreaming from "../pages/admin/AdminStreaming";

// Stakeholder
import StakeholderDashboard from "../pages/stakeholder/StakeholderDashboard";
import ViewContent from "../pages/stakeholder/ViewContent";
import StakeholderMessages from "../pages/stakeholder/StakeholderMessages";
import StakeholderProfile from "../pages/stakeholder/StakeholderProfile";
import StakeholderProfileEdit from "../pages/stakeholder/StakeholderProfileEdit";
import StakeholderFinance from "../pages/stakeholder/StakeholderFinance";
import StakeholderProjects from "../pages/stakeholder/StakeholderProjects";
import StakeholderProjectView from "../pages/stakeholder/StakeholderProjectView";
import StakeholderContentViewer from "../pages/stakeholder/StakeholderContentViewer";
import StakeholderNotifications from "../pages/stakeholder/StakeholderNotifications";
import StakeholderStreaming from "../pages/stakeholder/StakeholderStreaming";
import CreateProjectRequest from "../pages/stakeholder/CreateProjectRequest";
import EditorStreaming from "../pages/editor/EditorStreaming";
import { enterDemoMode } from "../services/demoService";
import RoleRoute from "./RoleRoute";
import { authService, getDashboardPathForRole } from "../services/authService";

function RoleDashboardRedirect() {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  const target = getDashboardPathForRole(user.role);
  return <Navigate to={target} replace />;
}

function guard(allowedRoles, element) {
  return <RoleRoute allowedRoles={allowedRoles}>{element}</RoleRoute>;
}

function DemoEntry() {
  enterDemoMode();
  return <Navigate to="/admin/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<DemoEntry />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/roles" element={<RoleSelection />} />
      <Route path="/signup" element={<Navigate to="/roles" replace />} />
      <Route path="/signup/:roleName" element={<Signup />} />

      {/* Role-based */}
      <Route path="/dashboard" element={<RoleDashboardRedirect />} />
      <Route path="/editor/dashboard" element={guard(["EDITOR"], <EditorDashboard />)} />
      <Route path="/projects" element={guard(["EDITOR"], <EditorProjects />)} />
      <Route path="/projects/:id/content" element={guard(["EDITOR"], <EditorProjectContent />)} />
      <Route path="/content/:id/view" element={guard(["EDITOR"], <EditorContentViewer />)} />
      <Route path="/content/:id/versions" element={guard(["EDITOR"], <EditorVersionHistory />)} />
      <Route path="/notifications" element={guard(["EDITOR"], <EditorNotifications />)} />
      <Route path="/editor/streaming" element={guard(["EDITOR"], <EditorStreaming />)} />

      <Route path="/admin/dashboard" element={guard(["ADMIN"], <AdminDashboard />)} />
      <Route path="/admin/projects" element={guard(["ADMIN"], <AdminProjects />)} />
      <Route path="/admin/projects/:id" element={guard(["ADMIN"], <AdminProjectDetail />)} />
      <Route path="/admin/analytics" element={guard(["ADMIN"], <AdminAnalytics />)} />
      <Route path="/admin/audit-log" element={guard(["ADMIN"], <AdminAuditLog />)} />
      <Route path="/admin/settings" element={guard(["ADMIN"], <AdminSettings />)} />
      <Route path="/admin/streaming" element={guard(["ADMIN"], <AdminStreaming />)} />

      <Route path="/stakeholder/home" element={guard(["STAKEHOLDER"], <StakeholderDashboard />)} />
      <Route path="/stakeholder/projects" element={guard(["STAKEHOLDER"], <StakeholderProjects />)} />
      <Route path="/stakeholder/projects/:id" element={guard(["STAKEHOLDER"], <StakeholderProjectView />)} />
      <Route path="/stakeholder/content/:id" element={guard(["STAKEHOLDER"], <StakeholderContentViewer />)} />
      <Route path="/stakeholder/notifications" element={guard(["STAKEHOLDER"], <StakeholderNotifications />)} />
      <Route path="/stakeholder/streaming" element={guard(["STAKEHOLDER"], <StakeholderStreaming />)} />
      <Route path="/stakeholder/create-project-request" element={guard(["STAKEHOLDER"], <CreateProjectRequest />)} />
      <Route path="/stakeholder/create-request" element={guard(["STAKEHOLDER"], <Navigate to="/stakeholder/create-project-request" replace />)} />

      {/* Legacy aliases */}
      <Route path="/editor" element={<Navigate to="/editor/dashboard" replace />} />
      <Route path="/editor/content" element={guard(["EDITOR"], <MyContent />)} />
      <Route path="/editor/messages" element={guard(["EDITOR"], <EditorMessages />)} />
      <Route path="/editor/profile" element={guard(["EDITOR"], <EditorProfile />)} />
      <Route path="/editor/profile/edit" element={guard(["EDITOR"], <EditorProfileEdit />)} />
      <Route path="/editor/finance" element={guard(["EDITOR"], <EditorFinance />)} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/users" element={guard(["ADMIN"], <ManageUsers />)} />
      <Route path="/admin/messages" element={guard(["ADMIN"], <AdminMessages />)} />
      <Route path="/admin/profile" element={guard(["ADMIN"], <AdminProfile />)} />
      <Route path="/admin/profile/edit" element={guard(["ADMIN"], <AdminProfileEdit />)} />
      <Route path="/admin/finance" element={guard(["ADMIN"], <AdminFinance />)} />
      <Route path="/admin/content" element={guard(["ADMIN"], <AdminContent />)} />
      <Route path="/stakeholder" element={<Navigate to="/stakeholder/home" replace />} />
      <Route path="/editor-home" element={<Navigate to="/dashboard" replace />} />
      <Route path="/stakeholder-dashboard" element={guard(["STAKEHOLDER"], <StakeholderDashboard />)} />
      <Route path="/stakeholder/content" element={guard(["STAKEHOLDER"], <ViewContent />)} />
      <Route path="/stakeholder/messages" element={guard(["STAKEHOLDER"], <StakeholderMessages />)} />
      <Route path="/stakeholder/profile" element={guard(["STAKEHOLDER"], <StakeholderProfile />)} />
      <Route path="/stakeholder/profile/edit" element={guard(["STAKEHOLDER"], <StakeholderProfileEdit />)} />
      <Route path="/stakeholder/finance" element={guard(["STAKEHOLDER"], <StakeholderFinance />)} />
      <Route path="/role-dashboard" element={<RoleDashboardRedirect />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
