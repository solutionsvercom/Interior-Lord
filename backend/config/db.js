const dns = require('dns');
const mongoose = require('mongoose');

const PUBLIC_DNS = ['8.8.8.8', '1.1.1.1'];

function isAtlasUri(uri) {
  return /^mongodb\+srv:\/\//i.test(uri);
}

function usePublicDns() {
  try {
    dns.setServers(PUBLIC_DNS);
  } catch {
    /* keep the system resolver if this process cannot change it */
  }
}

function publicLookup(hostname, options, callback) {
  usePublicDns();
  dns.resolve4(hostname, (err, addresses) => {
    if (!err && addresses && addresses.length) {
      callback(null, addresses[0], 4);
      return;
    }
    dns.lookup(hostname, { family: 4 }, callback);
  });
}

function redact(text) {
  return String(text || '').replace(/\/\/[^@/]+@/g, '//***@');
}

let guardsAttached = false;

function attachConnectionGuards() {
  if (guardsAttached) return;
  guardsAttached = true;
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', redact(err.message));
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected; retrying...');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing from .env');
  }

  mongoose.set('strictQuery', true);
  usePublicDns();
  attachConnectionGuards();

  const options = {
    serverSelectionTimeoutMS: isAtlasUri(uri) ? 20000 : 4000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
    family: 4,
    lookup: publicLookup
  };

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await mongoose.connect(uri, options);
      console.log(`MongoDB connected: db=${mongoose.connection.name}`);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`MongoDB connection attempt ${attempt}/3 failed`);
      console.warn(`   ${redact(err.message)}`);
      try { await mongoose.disconnect(); } catch { /* ignore */ }
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  if (isAtlasUri(uri)) {
    throw lastError || new Error('Atlas connection failed. Check Network Access and that the cluster is running.');
  }

  try { await mongoose.disconnect(); } catch { /* ignore */ }
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = require('mongodb-memory-server'));
  } catch {
    throw lastError || new Error('MongoDB is not available');
  }
  const memory = await MongoMemoryServer.create();
  await mongoose.connect(memory.getUri());
  console.log(`In-memory MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = connectDB;
