const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(__dirname, '..', 'data.json');

let state = null;

function loadState() {
  if (state) return state;
  if (fs.existsSync(DATA_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
      state = null;
    }
  }
  if (!state) {
    state = {
      users: [],
      password_resets: [],
      lastUserId: 0,
      lastResetId: 0,
    };
  }
  return state;
}

function saveState() {
  if (!state) return;
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function initDb() {
  const s = loadState();

  const count = s.users.length;
  if (count === 0) {
    const defaultPassword = 'Password123!';
    const hash = bcrypt.hashSync(defaultPassword, 10);
    const id = ++s.lastUserId;
    s.users.push({
      id,
      username: 'admin',
      email: 'admin@example.com',
      password_hash: hash,
      created_at: new Date().toISOString(),
    });
    saveState();
    console.log('Seeded default user: admin / Password123!');
  }
}

function getUserById(id) {
  const s = loadState();
  return s.users.find((u) => u.id === id) || null;
}

function getUserByUsername(username) {
  const s = loadState();
  return s.users.find((u) => u.username === username) || null;
}

function userExistsByUsernameOrEmail(username, email) {
  const s = loadState();
  return (
    s.users.find((u) => u.username === username || u.email === email) || null
  );
}

function createUser(username, email, passwordHash) {
  const s = loadState();
  const id = ++s.lastUserId;
  s.users.push({
    id,
    username,
    email,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  });
  saveState();
  return id;
}

function createPasswordReset(userId, token) {
  const s = loadState();
  const id = ++s.lastResetId;
  s.password_resets.push({
    id,
    user_id: userId,
    token,
    created_at: new Date().toISOString(),
    used: 0,
  });
  saveState();
  return id;
}

function getLatestPasswordResetForUserAndToken(userId, token) {
  const s = loadState();
  const rows = s.password_resets
    .filter((r) => r.user_id === userId && r.token === token && r.used === 0)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return rows[0] || null;
}

function updateUserPasswordAndMarkResetUsed(userId, newHash, resetId) {
  const s = loadState();
  const user = s.users.find((u) => u.id === userId);
  if (user) {
    user.password_hash = newHash;
  }
  const reset = s.password_resets.find((r) => r.id === resetId);
  if (reset) {
    reset.used = 1;
  }
  saveState();
}

module.exports = {
  initDb,
  getUserById,
  getUserByUsername,
  userExistsByUsernameOrEmail,
  createUser,
  createPasswordReset,
  getLatestPasswordResetForUserAndToken,
  updateUserPasswordAndMarkResetUsed,
};

