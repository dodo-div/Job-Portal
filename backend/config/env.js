const path = require('node:path');

const defaultOrigins = [
  'https://sweet-centaur-b993e3.netlify.app',
  'https://job-portal-green-seven-31.vercel.app',
  'https://job-portal-ashy-six.vercel.app',
  'http://localhost:3000',
];

function getConfig(env = process.env) {
  if (!env.MONGO_URI?.trim()) throw new Error('MONGO_URI is required');
  if (!env.JWT_SECRET || Buffer.byteLength(env.JWT_SECRET.trim()) < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes');
  }
  const port = Number(env.PORT ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT is invalid');
  const trustProxy = Number(env.TRUST_PROXY_HOPS ?? 0);
  if (!Number.isSafeInteger(trustProxy) || trustProxy < 0) throw new Error('TRUST_PROXY_HOPS is invalid');
  const corsOrigins = env.CORS_ORIGINS === undefined
    ? defaultOrigins
    : env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
  for (const origin of corsOrigins) {
    try {
      const url = new URL(origin);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) throw new Error();
    } catch {
      throw new Error('CORS_ORIGINS must contain exact HTTP(S) origins');
    }
  }
  return {
    mongoUri: env.MONGO_URI.trim(),
    jwtSecret: env.JWT_SECRET,
    exaApiKey: env.EXA_API_KEY?.trim(),
    port,
    trustProxy,
    corsOrigins,
    resumeDir: path.resolve(__dirname, '..', env.RESUME_DIR || 'private-resumes'),
    legacyResumeDirs: [...new Set([path.resolve('uploads'), path.resolve(__dirname, '../uploads')])],
  };
}

module.exports = getConfig;
