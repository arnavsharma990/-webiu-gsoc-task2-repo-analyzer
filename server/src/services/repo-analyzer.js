import config from '../config/env.js';
import { TTLCache } from '../lib/cache.js';
import { AppError } from '../lib/errors.js';
import {
  getCommitsCountLast30Days,
  getContributorsCount,
  getLanguages,
  getRepository,
  getRepositoryTreeSnapshot
} from '../lib/github.js';
import {
  calculateActivityScore,
  calculateComplexityScore,
  calculateLearningDifficulty
} from './scoring.js';

const analysisCache = new TTLCache(config.cacheTtlMs);

const fallbackFileEstimateFromSize = (repoSizeInKb) => Math.min(Math.round(repoSizeInKb / 8), 20_000);

export const isAnalysisCached = (fullName) => analysisCache.has(`analysis:${fullName}`);

export const analyzeRepository = async ({ owner, repo, normalizedUrl }) => {
  const fullName = `${owner}/${repo}`;
  const cacheKey = `analysis:${fullName}`;

  const { value, cached } = await analysisCache.remember(cacheKey, async () => {
    const repository = await getRepository(owner, repo);
    const warnings = [];

    const [languages, contributors, commitsLast30Days, treeSnapshot] = await Promise.all([
      getLanguages(owner, repo),
      getContributorsCount(owner, repo),
      getCommitsCountLast30Days(owner, repo, repository.default_branch).catch((error) => {
        if (error instanceof AppError && error.statusCode === 409) {
          warnings.push('No commits were found in the last 30 days on the default branch.');
          return 0;
        }

        throw error;
      }),
      getRepositoryTreeSnapshot(owner, repo, repository.default_branch).catch((error) => {
        if (error instanceof AppError && [404, 409].includes(error.statusCode)) {
          warnings.push('Repository tree inspection failed, so file count uses a conservative size-based estimate.');
          return {
            fileCountEstimate: fallbackFileEstimateFromSize(repository.size || 0),
            dependencyFiles: [],
            truncated: false
          };
        }

        throw error;
      })
    ]);

    if (treeSnapshot.truncated) {
      warnings.push('GitHub truncated the recursive tree listing. File count is an estimate.');
    }

    if ((repository.size || 0) === 0) {
      warnings.push('Repository appears to be empty or very small.');
    }

    const languageCount = Object.keys(languages || {}).length;
    const dependencyFileCount = treeSnapshot.dependencyFiles.length;

    const activity = calculateActivityScore({
      commitsLast30Days,
      contributors,
      openIssues: repository.open_issues_count || 0
    });

    const complexity = calculateComplexityScore({
      fileCountEstimate: treeSnapshot.fileCountEstimate,
      languageCount,
      dependencyFileCount
    });

    const difficulty = calculateLearningDifficulty({
      activityScore: activity.score,
      complexityScore: complexity.score
    });

    return {
      repo: fullName,
      owner,
      name: repo,
      url: normalizedUrl,
      description: repository.description,
      visibility: repository.private ? 'private' : 'public',
      defaultBranch: repository.default_branch,
      stars: repository.stargazers_count || 0,
      forks: repository.forks_count || 0,
      openIssues: repository.open_issues_count || 0,
      contributors,
      commitsLast30Days,
      languages: languages || {},
      fileCountEstimate: treeSnapshot.fileCountEstimate,
      languageCount,
      dependencyFiles: treeSnapshot.dependencyFiles,
      dependencyFileCount,
      activityScore: activity.score,
      activityBreakdown: activity.components,
      complexityScore: complexity.score,
      complexityBreakdown: complexity.components,
      difficulty: difficulty.label,
      difficultyScore: difficulty.score,
      warnings,
      analyzedAt: new Date().toISOString()
    };
  });

  return {
    ...value,
    cached
  };
};
