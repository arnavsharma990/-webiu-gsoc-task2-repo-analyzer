# GitHub Repository Intelligence Analyzer

GitHub Repository Intelligence Analyzer is a production-ready full-stack web application that accepts multiple GitHub repository URLs, fetches repository signals from the GitHub REST API, and converts them into practical engineering insights:

- Activity Score
- Project Complexity
- Learning Difficulty

The project is split into a React frontend and an Express backend so it can be deployed cleanly on Vercel plus Render or Railway.

## Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Charts: Recharts
- Backend: Node.js + Express
- Deployment: Vercel for the client, Render or Railway for the API

## Features

- Accepts multiple GitHub repository URLs at once
- Parses and deduplicates repository inputs
- Fetches stars, forks, open issues, contributors, languages, and commits from the last 30 days
- Estimates project complexity from file count, language diversity, and dependency manifests
- Normalizes scoring to a 0-100 scale
- Classifies repositories as Beginner, Intermediate, or Advanced
- Displays repository metrics in a clean dashboard with cards and charts
- Handles invalid URLs, inaccessible repositories, empty repositories, and GitHub API failures
- Uses in-memory TTL caching and in-flight request deduplication to reduce duplicate GitHub API traffic

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── components
│   │   ├── lib
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
├── server
│   ├── scripts
│   │   └── sample-repos.js
│   ├── src
│   │   ├── config
│   │   ├── lib
│   │   ├── routes
│   │   ├── services
│   │   ├── app.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── package.json
├── render.yaml
└── README.md
```

## How Scoring Works

### 1. Activity Score

The application gathers:

- Commits in the last 30 days
- Contributor count
- Open issue count

Each metric is normalized to a 0-100 scale and combined using the requested weighted formula:

```text
activity_score =
	(normalized_commits_last_30_days * 0.5) +
	(normalized_contributors * 0.3) +
	(normalized_open_issues * 0.2)
```

Normalization caps used by the backend:

- Commits: 300
- Contributors: 100
- Open issues: 500

The final score is rounded to an integer from 0 to 100.

### 2. Complexity Score

The application combines:

- Estimated file count from the Git tree API
- Language diversity from GitHub languages data
- Dependency manifests detected in the repository tree

Formula:

```text
complexity_score =
	(normalized_file_count * 0.4) +
	(normalized_language_diversity * 0.3) +
	(normalized_dependency_files * 0.3)
```

Normalization caps used by the backend:

- Files: 20,000
- Languages: 8
- Dependency manifests: 6

### 3. Learning Difficulty

Difficulty is derived from both complexity and activity, with complexity weighted more heavily because onboarding is primarily constrained by structure and breadth.

```text
difficulty_score =
	(complexity_score * 0.7) +
	(activity_score * 0.3)
```

Difficulty bands:

- Beginner: below 30
- Intermediate: 30 to 70
- Advanced: above 70

## Assumptions

- Public repositories are the main target. Private repositories require a GitHub token with sufficient access.
- GitHub recursive tree responses can be truncated on very large repositories. In that case, file count remains an estimate.
- Open issues are treated as an activity signal because the prompt requires it, even though issue volume can also indicate maintenance burden.
- Dependency detection is based on common manifest files such as `package.json`, `requirements.txt`, `pyproject.toml`, `pom.xml`, and `go.mod`.

## Limitations

- The GitHub REST API does not expose a single perfect “project complexity” metric, so the score is heuristic by design.
- Very large repositories can cause tree inspection to truncate, which may undercount files or miss some manifests.
- Contributor count is estimated from paginated API metadata and can vary slightly depending on anonymous contributors.
- Without a GitHub token, rate limits are low and sample testing on large repositories may fail.

## API Contract

### POST /analyze

Request body:

```json
{
	"urls": [
		"https://github.com/facebook/react",
		"https://github.com/nodejs/node"
	]
}
```

Response shape:

```json
{
	"results": [
		{
			"repo": "facebook/react",
			"stars": 200000,
			"forks": 40000,
			"activityScore": 85,
			"complexityScore": 70,
			"difficulty": "Advanced",
			"languages": {
				"JavaScript": 1000,
				"TypeScript": 800
			}
		}
	],
	"errors": [],
	"meta": {
		"requested": 2,
		"uniqueRepositories": 2,
		"analyzed": 2,
		"failed": 0,
		"cached": 0,
		"generatedAt": "2026-03-17T00:00:00.000Z"
	}
}
```

## Local Development

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure environment variables

Backend:

```bash
cp server/.env.example server/.env
```

Frontend:

```bash
cp client/.env.example client/.env
```

Required backend variables:

- `GITHUB_TOKEN`: GitHub personal access token for authenticated API access
- `PORT`: API port, default `4000`
- `CLIENT_ORIGIN`: allowed frontend origin for CORS, default `http://localhost:5173`
- `CACHE_TTL_MS`: in-memory cache TTL, default `900000`
- `REQUEST_TIMEOUT_MS`: outbound GitHub request timeout, default `15000`

Required frontend variable:

- `VITE_API_BASE_URL`: backend URL, default `http://localhost:4000`

### 3. Start the full stack app

```bash
npm run dev
```

This starts:

- React frontend on `http://localhost:5173`
- Express backend on `http://localhost:4000`

### 4. Build for production

```bash
npm run build
```

## Sample Testing

The repository includes a script that analyzes the required sample repositories:

- `facebook/react`
- `nodejs/node`
- `vercel/next.js`
- `tensorflow/tensorflow`
- `kubernetes/kubernetes`

Run it from the root:

```bash
npm run test:sample
```

The script prints a console table with activity, complexity, difficulty, commit, contributor, and language counts.

## Deployment

### Backend on Render

The repository includes a root `render.yaml` that points Render to the `server` directory.

Render steps:

1. Create a new Blueprint or Web Service in Render.
2. Point it at this repository.
3. Use the included `render.yaml`, or configure manually with:
	 - Root directory: `server`
	 - Build command: `npm install`
	 - Start command: `npm run start`
4. Add environment variables:
	 - `GITHUB_TOKEN`
	 - `CLIENT_ORIGIN`
5. Confirm the health check at `/health`.

### Backend on Railway

Railway steps:

1. Create a new project from the repository.
2. Set the service root to `server`.
3. Set build command to `npm install`.
4. Set start command to `npm run start`.
5. Add `GITHUB_TOKEN` and `CLIENT_ORIGIN` in Railway environment settings.

### Frontend on Vercel

The client includes `client/vercel.json` for SPA rewrites.

Vercel steps:

1. Import the repository into Vercel.
2. Set the project root directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
	 - `VITE_API_BASE_URL=https://your-backend-domain.com`

## Production Notes

- The backend uses TTL caching plus in-flight deduplication to avoid duplicate GitHub API calls.
- The API returns partial success responses when some repositories fail.
- The frontend is configured as a static SPA and the backend is deployable as a standalone Node service.
- The `/health` route is ready for uptime checks and platform health verification.