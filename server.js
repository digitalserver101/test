const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');

const { initDb } = require('./src/db');
const authRoutes = require('./src/routes/auth');
const { sendDecoy } = require('./src/lib/decoyResponse');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy so req.ip uses X-Forwarded-* headers
app.set('trust proxy', true);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'very-secret-but-not-really',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, 'public')));

// Expose backend JS for training: list at /src, files at /src/path/to/file.js
const srcDir = path.join(__dirname, 'src');
function listJsFiles(dir, base = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const rel = base ? base + '/' + item.name : item.name;
    if (item.isDirectory()) {
      files.push(...listJsFiles(path.join(dir, item.name), rel));
    } else if (item.name.endsWith('.js')) {
      files.push(rel);
    }
  }
  return files;
}
app.get('/src', (req, res) => {
  const files = listJsFiles(srcDir);
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Source</title></head><body><h1>JS files</h1><ul>' +
    files.map(f => '<li><a href="/src/' + f + '">' + f + '</a></li>').join('') +
    '</ul></body></html>';
  res.type('html').send(html);
});
app.use('/src', express.static(srcDir, { index: false }));

// Initialize DB then start server
initDb();

app.use('/', authRoutes);

app.use((req, res) => {
  sendDecoy(res);
});

const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

