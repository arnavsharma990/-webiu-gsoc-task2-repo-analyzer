const caps = {
  commits: 300,
  contributors: 100,
  openIssues: 500,
  files: 20_000,
  languages: 8,
  dependencies: 6
};

const normalize = (value, maxValue) => {
  if (!value || value <= 0) {
    return 0;
  }

  return Math.min((value / maxValue) * 100, 100);
};

export const calculateActivityScore = ({ commitsLast30Days, contributors, openIssues }) => {
  const commitsComponent = normalize(commitsLast30Days, caps.commits);
  const contributorsComponent = normalize(contributors, caps.contributors);
  const issuesComponent = normalize(openIssues, caps.openIssues);

  const score = Math.round(
    commitsComponent * 0.5 +
      contributorsComponent * 0.3 +
      issuesComponent * 0.2
  );

  return {
    score,
    components: {
      commits: Math.round(commitsComponent),
      contributors: Math.round(contributorsComponent),
      openIssues: Math.round(issuesComponent)
    }
  };
};

export const calculateComplexityScore = ({ fileCountEstimate, languageCount, dependencyFileCount }) => {
  const fileComponent = normalize(fileCountEstimate, caps.files);
  const languageComponent = normalize(languageCount, caps.languages);
  const dependencyComponent = normalize(dependencyFileCount, caps.dependencies);

  const score = Math.round(
    fileComponent * 0.4 +
      languageComponent * 0.3 +
      dependencyComponent * 0.3
  );

  return {
    score,
    components: {
      files: Math.round(fileComponent),
      languages: Math.round(languageComponent),
      dependencies: Math.round(dependencyComponent)
    }
  };
};

export const calculateLearningDifficulty = ({ activityScore, complexityScore }) => {
  const score = Math.round(complexityScore * 0.7 + activityScore * 0.3);

  if (score < 30) {
    return {
      score,
      label: 'Beginner'
    };
  }

  if (score <= 70) {
    return {
      score,
      label: 'Intermediate'
    };
  }

  return {
    score,
    label: 'Advanced'
  };
};

export const scoringCaps = caps;
