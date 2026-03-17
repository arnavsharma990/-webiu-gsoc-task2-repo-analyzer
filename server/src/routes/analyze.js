import { Router } from 'express';

import { AppError } from '../lib/errors.js';
import { analyzeRepository } from '../services/repo-analyzer.js';
import {
  normalizeUrlInputs,
  parseRepositoryInput
} from '../services/repository-url.js';

const router = Router();

router.post('/analyze', async (req, res, next) => {
  try {
    const rawUrls = normalizeUrlInputs(req.body?.urls);

    if (!rawUrls.length) {
      throw new AppError('Provide at least one GitHub repository URL.', 400);
    }

    const repositories = [];
    const errors = [];
    const seen = new Set();

    rawUrls.forEach((url) => {
      try {
        const parsed = parseRepositoryInput(url);

        if (seen.has(parsed.fullName)) {
          return;
        }

        seen.add(parsed.fullName);
        repositories.push(parsed);
      } catch (error) {
        errors.push({
          url,
          message: error.message || 'Invalid repository URL.'
        });
      }
    });

    if (!repositories.length) {
      return res.status(400).json({
        results: [],
        errors,
        meta: {
          requested: rawUrls.length,
          uniqueRepositories: 0,
          analyzed: 0,
          failed: errors.length,
          cached: 0,
          generatedAt: new Date().toISOString()
        }
      });
    }

    const settledResults = await Promise.allSettled(
      repositories.map((repository) => analyzeRepository(repository))
    );

    const results = [];
    let cachedCount = 0;

    settledResults.forEach((result, index) => {
      const source = repositories[index];

      if (result.status === 'fulfilled') {
        if (result.value.cached) {
          cachedCount += 1;
        }

        results.push(result.value);
        return;
      }

      errors.push({
        url: source.normalizedUrl,
        repo: source.fullName,
        message: result.reason?.message || 'Failed to analyze repository.'
      });
    });

    const statusCode = results.length > 0 ? 200 : 502;

    return res.status(statusCode).json({
      results,
      errors,
      meta: {
        requested: rawUrls.length,
        uniqueRepositories: repositories.length,
        analyzed: results.length,
        failed: errors.length,
        cached: cachedCount,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
