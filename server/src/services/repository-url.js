import { AppError } from '../lib/errors.js';

const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

const splitInput = (value) =>
  value
    .split(/[\n,]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

export const normalizeUrlInputs = (input) => {
  if (Array.isArray(input)) {
    return input.flatMap((entry) => splitInput(String(entry)));
  }

  if (typeof input === 'string') {
    return splitInput(input);
  }

  return [];
};

const buildRepositoryShape = (owner, repo) => ({
  owner,
  repo,
  fullName: `${owner}/${repo}`,
  normalizedUrl: `https://github.com/${owner}/${repo}`
});

export const parseRepositoryInput = (input) => {
  const value = String(input || '').trim();

  if (!value) {
    throw new AppError('Invalid GitHub repository URL.', 400, { input });
  }

  const sshMatch = value.match(/^git@github\.com:(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?$/i);

  if (sshMatch?.groups?.owner && sshMatch?.groups?.repo) {
    return buildRepositoryShape(sshMatch.groups.owner, sshMatch.groups.repo);
  }

  const shorthandMatch = value.match(/^(?<owner>[A-Za-z0-9_.-]+)\/(?<repo>[A-Za-z0-9_.-]+?)(?:\.git)?$/);

  if (shorthandMatch?.groups?.owner && shorthandMatch?.groups?.repo && !value.startsWith('http')) {
    return buildRepositoryShape(shorthandMatch.groups.owner, shorthandMatch.groups.repo);
  }

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new AppError('Invalid GitHub repository URL.', 400, { input: value });
  }

  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) {
    throw new AppError('Only github.com repository URLs are supported.', 400, { input: value });
  }

  const [owner, repoWithSuffix] = url.pathname.split('/').filter(Boolean);
  const repo = repoWithSuffix?.replace(/\.git$/i, '');

  if (!owner || !repo) {
    throw new AppError('Invalid GitHub repository URL.', 400, { input: value });
  }

  return buildRepositoryShape(owner, repo);
};
