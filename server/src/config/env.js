import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOrigins = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const config = {
  port: parseNumber(process.env.PORT, 4000),
  githubToken: process.env.GITHUB_TOKEN?.trim() || '',
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
  cacheTtlMs: parseNumber(process.env.CACHE_TTL_MS, 15 * 60 * 1000),
  requestTimeoutMs: parseNumber(process.env.REQUEST_TIMEOUT_MS, 15_000)
};

export default config;
