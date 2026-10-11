console.log('Interior Lord process starting');

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seed = require('./config/seed');
const { corsMiddleware } = require('./middleware/cors');
const contentRouter = require('./routes/content');
const contactRouter = require('./routes/contact');

const app = express();
const localEnv = fs.existsSync(path.join(__dirname, '.env'));

function resolvePort() {
  const configured = process.env.PORT;
  // Hostinger's proxy calls the port it assigns, usually 3000.
  // 5000 is only the local API port. Binding to it on the server makes the site time out.
  if (!localEnv && (!configured || String(configured) === '5000')) {
    return 3000;
  }
  return configured || 5000;
}

const PORT = resolvePort();
const HOST = !localEnv ? '0.0.0.0' : (process.env.HOST || '0.0.0.0');
const publicDir = path.join(__dirname, 'public');

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

app.get(/^(?!\/api).*/, (req, res, next) => {
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
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('unhandledRejection', (reason) => {
  const message = reason && reason.message ? reason.message : String(reason);
  console.error('Unhandled promise rejection:', message.replace(/\/\/[^@/]+@/g, '//***@'));
});

function listen() {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, HOST, () => {
      console.log(`Interior Lord running on ${HOST}:${PORT}`);
      resolve(server);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${PORT} is already in use. Stop the other API and start this one again.`));
        return;
      }
      reject(err);
    });
  });
}

async function start() {
  console.log(`Starting Interior Lord on ${HOST}:${PORT}`);
  if (!localEnv && String(process.env.PORT) === '5000') {
    console.warn('PORT=5000 is the local API port. Hostinger traffic is on 3000, so this process is listening there.');
  }

  try {
    await listen();
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }

  try {
    await connectDB();
    await seed();
    console.log('Database ready');
  } catch (err) {
    console.error('Database unavailable:', String(err.message || err).replace(/\/\/[^@/]+@/g, '//***@'));
    console.error('The website is still being served. Live content and the contact form need MongoDB.');
  }
}

start();
