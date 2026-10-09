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
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
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

async function start() {
  try {
    await connectDB();
    await seed();
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, HOST, () => {
        console.log(`Interior Lord running on ${HOST}:${PORT}`);
        resolve();
      });
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${PORT} is already in use. Stop the other API and start this one again.`));
          return;
        }
        reject(err);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
