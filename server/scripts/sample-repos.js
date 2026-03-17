import { analyzeRepository } from '../src/services/repo-analyzer.js';
import { parseRepositoryInput } from '../src/services/repository-url.js';

const sampleRepositories = [
  'https://github.com/facebook/react',
  'https://github.com/nodejs/node',
  'https://github.com/vercel/next.js',
  'https://github.com/tensorflow/tensorflow',
  'https://github.com/kubernetes/kubernetes'
];

const rows = [];

for (const repositoryUrl of sampleRepositories) {
  const repository = parseRepositoryInput(repositoryUrl);

  try {
    const analysis = await analyzeRepository(repository);

    rows.push({
      repo: analysis.repo,
      activityScore: analysis.activityScore,
      complexityScore: analysis.complexityScore,
      difficulty: analysis.difficulty,
      commits30d: analysis.commitsLast30Days,
      contributors: analysis.contributors,
      languages: analysis.languageCount
    });
  } catch (error) {
    rows.push({
      repo: repository.fullName,
      error: error.message
    });
  }
}

console.table(rows);