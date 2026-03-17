import config from './config/env.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.port, () => {
  if (!config.githubToken) {
    console.warn('GITHUB_TOKEN is not configured. Public GitHub API rate limits will be low.');
  }

  console.log(`Repository Intelligence API listening on port ${config.port}`);
});
