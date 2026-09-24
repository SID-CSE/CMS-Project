import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPathForRole } from "../services/authService";
import { authService } from "../services/authService";

function LegacyVerificationBanner({ user }) {
  const [message, setMessage] = useState('');
  const resend = async () => {
    const result = await authService.resendVerification(user.email);
    setMessage(result.developmentVerificationUrl || result.message);
  };

  if (user.emailVerified === true) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg">
      <span><strong>Your email is not verified.</strong> You can continue using your existing account, but please verify it to secure your account.</span>
      <button type="button" onClick={resend} className="rounded-lg bg-amber-950 px-3 py-2 text-xs font-bold text-white">Verify Email</button>
      {message && <span className="basis-full break-all text-xs">{message}</span>}
    </div>
  );
}

function normalizeRole(role) {
  return (role || "").toString().trim().toUpperCase();
}

export default function RoleRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  const currentRole = normalizeRole(user.role);
  const allowed = allowedRoles.map(normalizeRole);
  if (!allowed.includes(currentRole)) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return <>{children}<LegacyVerificationBanner user={user} /></>;
}