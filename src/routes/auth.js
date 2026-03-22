const express = require('express');
const bcrypt = require('bcryptjs');
const {
  getUserById,
  getUserByUsername,
  userExistsByUsernameOrEmail,
  createUser,
  createPasswordReset,
  getLatestPasswordResetForUserAndToken,
  updateUserPasswordAndMarkResetUsed,
} = require('../db');
const { hasValidContext } = require('../lib/requestContext');
const { sendDecoy } = require('../lib/decoyResponse');

const router = express.Router();

// Simple in-memory rate limit for password reset token attempts
// Keyed by combination of ip + username
const resetAttemptBuckets = {};
const RESET_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RESET_MAX_ATTEMPTS = 25;

function getResetBucket(ip, username) {
  const key = `${ip}|${username}`;
  let bucket = resetAttemptBuckets[key];
  const now = Date.now();
  if (!bucket || now - bucket.firstAttemptAt > RESET_WINDOW_MS) {
    bucket = { count: 0, firstAttemptAt: now };
    resetAttemptBuckets[key] = bucket;
  }
  return bucket;
}

router.get('/', (req, res) => {
  let username = null;
  if (req.session.userId) {
    const user = getUserById(req.session.userId);
    username = user ? user.username : null;
  }
  res.set('Cache-Control', 'no-store');
  res.status(200).render('index', { username, isLanding: true });
});

router.get('/login', (req, res) => {
  res.render('login', { message: null, justRegistered: false });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = getUserByUsername(username);

  let ok = false;
  if (user) {
    ok = bcrypt.compareSync(password, user.password_hash);
  } else {
    // Constant-ish time fake compare to reduce timing differences
    bcrypt.compareSync(
      password || '',
      '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.q2Y7xO6vwxKF1u9Ii.YivGi99ZTS'
    );
  }

  if (!ok) {
    return res.render('login', {
      message: 'Invalid username or password.',
    });
  }

  req.session.userId = user.id;
  res.redirect('/');
});

router.get('/register', (req, res) => {
  if (!hasValidContext(req)) {
    return sendDecoy(res);
  }
  res.render('register', { message: null });
});

router.post('/register', (req, res) => {
  if (!hasValidContext(req)) {
    return sendDecoy(res);
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render('register', {
      message: 'All fields are required.',
    });
  }

  const existing = userExistsByUsernameOrEmail(username, email);
  if (existing) {
    return res.render('register', {
      message: 'Registration failed. Please try different credentials.',
    });
  }

  const hash = bcrypt.hashSync(password, 10);
  createUser(username, email, hash);

  res.render('login', {
    message: 'Account created. You can now log in.',
    justRegistered: true,
  });
});

router.get('/forgot', (req, res) => {
  res.render('forgot', { message: null });
});

// Request reset: no username enumeration
router.post('/forgot', (req, res) => {
  const { username } = req.body;
  const user = getUserByUsername(username);

  if (user) {
    const token = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    createPasswordReset(user.id, token);

    // "Send" email by logging to server console; for CTF training
    console.log(
      `Password reset token for ${user.username} (${user.email}): ${token}`
    );
  }

  res.render('forgot', {
    message:
      'If that account exists, an email with a reset code has been sent.',
  });
});

router.get('/reset', (req, res) => {
  res.render('reset', { message: null });
});

router.post('/reset', (req, res) => {
  const { username, token, newPassword } = req.body;

  const ip = req.ip;
  const bucket = getResetBucket(ip, username || '');
  bucket.count += 1;

  if (bucket.count > RESET_MAX_ATTEMPTS) {
    return res.status(200).render('reset', {
      message:
        'Too many attempts. Please wait a while before trying again.',
    });
  }

  const user = getUserByUsername(username);

  if (!user) {
    return res.render('reset', {
      message: 'Invalid username, token, or password.',
    });
  }

  const resetRow = getLatestPasswordResetForUserAndToken(user.id, token);

  if (!resetRow) {
    return res.render('reset', {
      message: 'Invalid username, token, or password.',
    });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.render('reset', {
      message: 'Invalid username, token, or password.',
    });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  updateUserPasswordAndMarkResetUsed(user.id, hash, resetRow.id);

  bucket.count = 0;

  res.render('login', {
    message: 'Password reset successful. You can now log in.',
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;

