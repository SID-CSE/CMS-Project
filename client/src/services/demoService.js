const DEMO_TOKEN = "contify-demo-token";
const DEMO_USER = {
  id: "demo-user",
  name: "Demo Visitor",
  username: "demo",
  email: "demo@contify.local",
  role: "ADMIN",
  emailVerified: true,
  demo: true,
};

export function isDemoMode() {
  return localStorage.getItem("authToken") === DEMO_TOKEN;
}

export function getDemoUser() {
  return DEMO_USER;
}

export function enterDemoMode() {
  localStorage.setItem("authToken", DEMO_TOKEN);
  localStorage.setItem("currentUser", JSON.stringify(DEMO_USER));
  localStorage.setItem("contify_current_user", JSON.stringify(DEMO_USER));
  localStorage.setItem("userId", DEMO_USER.id);
  localStorage.setItem("userRole", DEMO_USER.role);
  localStorage.setItem("userEmail", DEMO_USER.email);
  localStorage.setItem("username", DEMO_USER.username);
  return DEMO_USER;
}
