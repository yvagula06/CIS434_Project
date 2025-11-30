require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// In-memory user store
const users = new Map();

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

  const key = email.toLowerCase();
  if (users.has(key)) return res.status(400).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const id = Date.now().toString(36);
  const user = { id, name, email: key, passwordHash };
  users.set(key, user);

  const token = signToken({ id: user.id, email: user.email });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  const key = email.toLowerCase();
  const user = users.get(key);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user.id, email: user.email });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/auth/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid token' });

  const user = users.get(payload.email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  return res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});