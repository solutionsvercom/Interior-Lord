const cors = require('cors');

function allowedOrigins() {
  const configured = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...configured
  ]);
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins().has(origin)) {
      callback(null, true);
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true
};

module.exports = { corsOptions, corsMiddleware: cors(corsOptions) };
