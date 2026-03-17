import config from '../config/env.js';
import { TTLCache } from './cache.js';
import { AppError } from './errors.js';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const githubCache = new TTLCache(config.cacheTtlMs);

const buildHeaders = () => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-repository-intelligence-analyzer'
  };

  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }

  return headers;
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const parseLinkHeader = (headerValue) => {
  if (!headerValue) {
    return {};
  }

  return headerValue.split(',').reduce((links, part) => {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);

    if (!match) {
      return links;
    }

    const [, url, relation] = match;
    links[relation] = url;
    return links;
  }, {});
};

const countFromPerPageOneHeader = (linkHeader) => {
  const links = parseLinkHeader(linkHeader);
  const lastPageUrl = links.last;

  if (!lastPageUrl) {
    return null;
  }

  const page = Number.parseInt(new URL(lastPageUrl).searchParams.get('page') || '', 10);
  return Number.isFinite(page) ? page : null;
};

const buildRateLimitMessage = (response, payload) => {
  const resetEpoch = response.headers.get('x-ratelimit-reset');

  if (!resetEpoch) {
    return payload?.message || 'GitHub API rate limit exceeded.';
  }

  const resetAt = new Date(Number.parseInt(resetEpoch, 10) * 1000);
  return `GitHub API rate limit exceeded. Try again after ${resetAt.toISOString()}.`;
};

const mapGitHubError = (response, payload) => {
  if (response.status === 404) {
    return new AppError('Repository not found or inaccessible. It may be private.', 404, payload);
  }

  if (response.status === 409) {
    return new AppError('Repository is empty or has no commits yet.', 409, payload);
  }

  const remaining = response.headers.get('x-ratelimit-remaining');
  const isRateLimitError = response.status === 403 && (remaining === '0' || payload?.message?.toLowerCase().includes('rate limit'));

  if (isRateLimitError) {
    return new AppError(buildRateLimitMessage(response, payload), 429, payload);
  }

  return new AppError(payload?.message || 'GitHub API request failed.', response.status, payload);
};

const requestGitHub = async (path, options = {}) => {
  const { cache = true, cacheTtlMs = config.cacheTtlMs } = options;
  const cacheKey = `github:${path}`;

  const fetcher = async () => {
    const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(config.requestTimeoutMs)
    });

    const responseText = await response.text();
    const payload = responseText ? safeJsonParse(responseText) : null;

    if (!response.ok) {
      throw mapGitHubError(response, payload);
    }

    return {
      data: payload,
      headers: {
        link: response.headers.get('link'),
        rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
        rateLimitReset: response.headers.get('x-ratelimit-reset')
      }
    };
  };

  if (!cache) {
    return fetcher();
  }

  const { value } = await githubCache.remember(cacheKey, fetcher, cacheTtlMs);
  return value;
};

export const isGitHubTokenConfigured = () => Boolean(config.githubToken);

export const getRepository = async (owner, repo) => {
  const { data } = await requestGitHub(`/repos/${owner}/${repo}`);
  return data;
};

export const getLanguages = async (owner, repo) => {
  const { data } = await requestGitHub(`/repos/${owner}/${repo}/languages`);
  return data || {};
};

export const getContributorsCount = async (owner, repo) => {
  const { data, headers } = await requestGitHub(`/repos/${owner}/${repo}/contributors?per_page=1&anon=1`);

  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  return countFromPerPageOneHeader(headers.link) ?? data.length;
};

export const getCommitsCountLast30Days = async (owner, repo, branch) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const path = `/repos/${owner}/${repo}/commits?since=${encodeURIComponent(since)}&per_page=1&sha=${encodeURIComponent(branch)}`;
  const { data, headers } = await requestGitHub(path, { cache: false });

  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  return countFromPerPageOneHeader(headers.link) ?? data.length;
};

const DEPENDENCY_MANIFESTS = new Set([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'requirements.txt',
  'pyproject.toml',
  'pipfile',
  'poetry.lock',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'cargo.toml',
  'go.mod',
  'gemfile',
  'composer.json'
]);

export const getRepositoryTreeSnapshot = async (owner, repo, branch) => {
  const { data } = await requestGitHub(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, {
    cacheTtlMs: config.cacheTtlMs * 2
  });

  const files = Array.isArray(data?.tree)
    ? data.tree.filter((item) => item.type === 'blob')
    : [];

  const dependencyFiles = new Set();

  files.forEach((item) => {
    const normalizedPath = item.path.split('/').pop()?.toLowerCase();

    if (normalizedPath && DEPENDENCY_MANIFESTS.has(normalizedPath)) {
      dependencyFiles.add(normalizedPath);
    }
  });

  return {
    fileCountEstimate: files.length,
    dependencyFiles: [...dependencyFiles],
    truncated: Boolean(data?.truncated)
  };
};
