/* Auth client service for server-backed mode (and optional demo mode).
   - For server mode (default), backend sets an httpOnly cookie on login/register.
   - The frontend uses /auth/me to check authentication.
*/
type RegisterPayload = { name: string; email: string; password: string };
type LoginPayload = { email: string; password: string };

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

let demoMode = false;
export function setDemoMode(flag: boolean) { demoMode = flag; }

async function registerServer(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Register failed" }));
    throw new Error(err.message || "Register failed");
  }
  return res.json();
}

async function loginServer(payload: LoginPayload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(err.message || "Login failed");
  }
  return res.json();
}

async function meServer() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    // Silently fail if server is not available
    return null;
  }
}

/* Optional demo-mode (kept for local fallback) */
async function sha256(message: string) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

type DemoUser = { id: string; name: string; email: string; passwordHash: string };

function getDemoUsers(): DemoUser[] {
  try {
    const raw = localStorage.getItem("demo_users");
    return raw ? JSON.parse(raw) as DemoUser[] : [];
  } catch { return []; }
}

function saveDemoUsers(users: DemoUser[]) { localStorage.setItem("demo_users", JSON.stringify(users)); }

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

async function registerLocal({ name, email, password }: RegisterPayload) {
  const users = getDemoUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already registered");
  const passwordHash = await sha256(password);
  const user: DemoUser = { id: generateId(), name, email, passwordHash };
  users.push(user);
  saveDemoUsers(users);
  const fakeToken = btoa(`${user.id}:${user.email}`);
  return { token: fakeToken, user: { id: user.id, name: user.name, email: user.email } };
}

async function loginLocal({ email, password }: LoginPayload) {
  const users = getDemoUsers();
  const passwordHash = await sha256(password);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);
  if (!user) throw new Error("Invalid email or password");
  const fakeToken = btoa(`${user.id}:${user.email}`);
  return { token: fakeToken, user: { id: user.id, name: user.name, email: user.email } };
}

/* Public API */
export async function register(payload: RegisterPayload) {
  if (demoMode) return registerLocal(payload);
  return registerServer(payload);
}

export async function login(payload: LoginPayload) {
  if (demoMode) return loginLocal(payload);
  return loginServer(payload);
}

export async function me() {
  if (demoMode) return null;
  return meServer();
}

export function storeToken(token: string | null) {
  if (demoMode && token) localStorage.setItem("auth_token", token);
}

export function clearToken() { localStorage.removeItem("auth_token"); }

export function getToken() { return localStorage.getItem("auth_token"); }

export default { register, login, me, setDemoMode, storeToken, clearToken, getToken };