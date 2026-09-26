import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import { getDashboardPathForRole } from "../../services/authService";
import { getRoleNavigation, isRoleRouteActive } from "./roleNavigationConfig";
import { isDemoMode } from "../../services/demoService";

function MenuIcon() {
  return (
    <span className="flex flex-col gap-1.5">
      <span className="h-0.5 w-5 rounded-full bg-slate-700" />
      <span className="h-0.5 w-5 rounded-full bg-slate-700" />
      <span className="h-0.5 w-5 rounded-full bg-slate-700" />
    </span>
  );
}

function SearchIcon() {
  return <span className="text-base text-slate-400">⌕</span>;
}

function ChevronIcon({ open }) {
  return <span className={`text-xs text-slate-500 transition ${open ? "rotate-180" : ""}`}>⌄</span>;
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function RoleNavbar({
  role = "editor",
  onMenuClick,
  notifications = [],
  sidebarOpen = true,
  compactProfile = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const config = getRoleNavigation(role);
  const userId = user?.id;

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      if (!userId) {
        if (active) setNotificationItems([]);
        return;
      }

      if (active) setLoadingNotifications(true);
      const result = await notificationService.getUserNotifications(userId);
      if (active) {
        setNotificationItems(result.ok ? result.data : []);
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 20000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [userId]);

  const unreadCount = useMemo(() => {
    const source = notificationItems.length ? notificationItems : notifications;
    return source.filter((item) => !(item.read === true || item.is_read === true || item.isRead === true)).length;
  }, [notificationItems, notifications]);

  const suggestions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return config.searchItems;

    return config.searchItems.filter((item) => {
      const label = (item.label || "").toLowerCase();
      const description = (item.description || "").toLowerCase();
      const to = (item.to || "").toLowerCase();
      return label.includes(value) || description.includes(value) || to.includes(value);
    });
  }, [query, config.searchItems]);

  const handleNavigate = (to) => {
    navigate(to);
    setProfileOpen(false);
    setQuery("");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleToggleNotifications = async () => {
    setNotificationOpen((prev) => !prev);
    if (!notificationOpen && userId) {
      const result = await notificationService.getUserNotifications(userId);
      if (result.ok) setNotificationItems(result.data);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await notificationService.markAsRead(notificationId);
    if (!result.ok) return;
    setNotificationItems((prev) => prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    const result = await notificationService.markAllAsRead(userId);
    if (!result.ok) return;
    setNotificationItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const profileName = user?.name || config.portalLabel;
  const profileSubLabel = user?.email || config.subtitle;
  const demo = isDemoMode();
  const demoRolePaths = [
    ["Admin", "/admin/dashboard"],
    ["Editor", "/editor/dashboard"],
    ["Stakeholder", "/stakeholder/home"],
  ];

  return (
    <header
      className={`fixed top-0 z-30 h-16 border-b border-slate-200 bg-white/90 backdrop-blur transition-all duration-300 ${
        sidebarOpen ? "left-0 w-full lg:left-70 lg:w-[calc(100%-17.5rem)]" : "left-0 w-full"
      }`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(getDashboardPathForRole(user?.role))}
            className="hover:opacity-75 transition cursor-pointer flex flex-col items-start gap-0.5"
          >
            <p className="text-sm font-semibold tracking-wide text-slate-900">Contify</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{config.portalLabel}</p>
          </button>
        </div>

        <div className="relative hidden w-full max-w-xl lg:block">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm">
            <SearchIcon />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages, workflows, and tools..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          {query.trim() && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleNavigate(item.to)}
                    className={`flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      isRoleRouteActive(location.pathname, item) ? "bg-blue-50" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                    </div>
                    {isRoleRouteActive(location.pathname, item) && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500">No results found.</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {demo ? (
            <div className="hidden items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 p-1 lg:flex" aria-label="Demo role views">
              {demoRolePaths.map(([label, path]) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${location.pathname.startsWith(path.split('/').slice(0, 2).join('/')) ? "bg-amber-200 text-amber-950" : "text-amber-800 hover:bg-amber-100"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-left shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              {config.initials}
            </div>
            {!compactProfile ? (
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{profileName}</p>
                <p className="text-xs text-slate-500">{profileSubLabel}</p>
              </div>
            ) : null}
            <ChevronIcon open={profileOpen} />
          </button>
        </div>
      </div>

      {profileOpen && (
        <div className="absolute right-4 top-[calc(100%+10px)] w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <button
            type="button"
            onClick={() => handleNavigate(config.homePath)}
            className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Open dashboard
          </button>
          {config.searchItems.slice(1, 6).map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => handleNavigate(item.to)}
              className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNavigate(config.searchItems.find((item) => item.label === "Profile")?.to || config.homePath)}
            className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}

      {notificationOpen && (
        <aside className="fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-full max-w-md border-l border-slate-200 bg-white shadow-2xl">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationOpen(false)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {loadingNotifications ? <p className="text-sm text-slate-500">Loading notifications...</p> : null}
              {!loadingNotifications && !notificationItems.length ? (
                <p className="text-sm text-slate-500">No notifications yet.</p>
              ) : null}

              <div className="space-y-2">
                {notificationItems.map((item) => {
                  const isRead = item.read === true || item.is_read === true || item.isRead === true;
                  return (
                    <article
                      key={item.id}
                      className={`rounded-xl border px-3 py-3 ${isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title || item.type || "Notification"}</p>
                          <p className="mt-1 text-sm text-slate-700">{item.message || "No message"}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatTime(item.createdAt)}</p>
                        </div>
                        {!isRead ? (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(item.id)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      )}
    </header>
  );
}
