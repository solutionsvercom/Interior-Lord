console.log('Interior Lord process starting');

const fs = require('fs');
const http = require('http');
const path = require('path');

function redact(text) {
  return String(text || '').replace(/\/\/[^@/]+@/g, '//***@');
}

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (err) {
  console.error('Could not load dotenv:', err.message);
}

function resolvePort() {
  const port = Number(process.env.PORT);
  if (Number.isInteger(port) && port > 0) return port;
  return 5000;
}

const PORT = resolvePort();
const HOST = process.env.HOST || '0.0.0.0';

let handle = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Interior Lord is starting.');
};

const server = http.createServer((req, res) => handle(req, res));
server.on('error', (err) => {
  console.error('Listen error:', err.message);
});
server.listen(PORT, HOST, () => {
  console.log(`Interior Lord listening on ${HOST}:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  const message = reason && reason.stack ? reason.stack : reason;
  console.error('Unhandled promise rejection:', redact(message));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', redact(err && err.stack ? err.stack : err));
});

function findPublicDir() {
  const candidates = [];
  const add = (dir) => {
    if (dir && !candidates.includes(dir)) candidates.push(dir);
  };

  add(path.join(__dirname, 'public'));
  add(path.resolve(process.cwd(), 'backend/public'));
  add(path.resolve(process.cwd(), 'public'));

  let dir = __dirname;
  for (let i = 0; i < 8; i += 1) {
    add(path.join(dir, 'public_html'));
    add(path.join(dir, 'backend', 'public'));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  const found = candidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html')));
  if (found) {
    console.log(`Serving website from ${found}`);
    return found;
  }

  console.error(`Website build was not found. Looked in: ${candidates.join(', ')}`);
  return path.join(__dirname, 'public');
}

function showError(err) {
  const message = redact(err && err.stack ? err.stack : err);
  console.error('Application failed to load:', message);
  handle = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Interior Lord could not finish starting.\n\n${message}`);
  };
}

try {
  const express = require('express');
  const mongoose = require('mongoose');
  const connectDB = require('./config/db');
  const seed = require('./config/seed');
  const { corsMiddleware } = require('./middleware/cors');
  const contentRouter = require('./routes/content');
  const contactRouter = require('./routes/contact');
  const app = express();
  const publicDir = findPublicDir();

  app.set('trust proxy', 1);
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/content', contentRouter);
  app.use('/api/contact', contactRouter);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Interior Lord API is running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  app.use(express.static(publicDir, { index: false }));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
      if (err) next();
    });
  });

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.status(404).send('Frontend build not found. Run npm run build.');
  });

  app.use((err, req, res, next) => {
    console.error(redact(err.stack));
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  handle = app;

  connectDB()
    .then(() => seed())
    .then(() => {
      console.log('Database ready');
    })
    .catch((err) => {
      console.error('Database unavailable:', redact(err && err.message ? err.message : err));
      console.error('The website is still being served. Live content and the contact form need MongoDB.');
    });
} catch (err) {
  showError(err);
}
