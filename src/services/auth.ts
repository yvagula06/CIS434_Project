/* Lightweight auth service with two modes:
   1) server mode: calls your backend endpoints (recommended for production)
   2) local/demo mode: stores hashed users in localStorage (only for prototyping)
*/
type RegisterPayload = { name: string; email: string; password: string };
type LoginPayload = { email: string; password: string };

const API_BASE = import.meta.env.VITE_API_BASE || ""; // e.g. '/api' or 'http://localhost:4000'

async function sha256(message: string) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const arr = Array.from(new Uint8Array(hash));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* SERVER MODE:
   Expects:
     POST ${API_BASE}/auth/register   { name, email, password }
     POST ${API_BASE}/auth/login      { email, password }
   Server should respond with JSON:
     { token: "<jwt>", user: { id, name, email } }
   OR set secure httpOnly cookie (recommended).
*/
async function registerServer(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include", // use cookies if backend sets them
  });
  if (!res.ok) throw new Error((await res.json()).message || "Register failed");
  return res.json();
}
async function loginServer(payload: LoginPayload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).message || "Login failed");
  return res.json();
}

/* LOCAL (demo) MODE: store user list in localStorage under 'demo_users'
   Passwords are stored as SHA-256 hashes (still not secure in a real app).
*/
type DemoUser = { id: string; name: string; email: string; passwordHash: string };

function getDemoUsers(): DemoUser[] {
  try {
    const raw = localStorage.getItem("demo_users");
    return raw ? JSON.parse(raw) as DemoUser[] : [];
  } catch {
    return [];
  }
}
function saveDemoUsers(users: DemoUser[]) {
  localStorage.setItem("demo_users", JSON.stringify(users));
}
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function registerLocal({ name, email, password }: RegisterPayload) {
  const users = getDemoUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already registered");
  }
  const passwordHash = await sha256(password);
  const user: DemoUser = { id: generateId(), name, email, passwordHash };
  users.push(user);
  saveDemoUsers(users);
  // return a fake token + user object
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

/* PUBLIC API:
   - setDemoMode(true) to use local/demo mode
   - register / login will call server or local implementations
   - storeToken writes token to localStorage (for demo). For production, prefer httpOnly cookies set by the server.
*/
let demoMode = true; // switch to false to call server endpoints (set this via environment or runtime)

export function setDemoMode(flag: boolean) {
  demoMode = flag;
}

export async function register(payload: RegisterPayload) {
  if (demoMode) return registerLocal(payload);
  return registerServer(payload);
}
export async function login(payload: LoginPayload) {
  if (demoMode) return loginLocal(payload);
  return loginServer(payload);
}

export function storeToken(token: string) {
  // For demo we store in localStorage; in production prefer cookies set by backend.
  localStorage.setItem("auth_token", token);
}
export function clearToken() {
  localStorage.removeItem("auth_token");
}
export function getToken() {
  return localStorage.getItem("auth_token");
}

export default { register, login, setDemoMode, storeToken, clearToken, getToken };