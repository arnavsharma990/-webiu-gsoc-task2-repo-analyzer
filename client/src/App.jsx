import { useMemo, useState } from 'react';

import Header from './components/Header.jsx';
import RepoCard from './components/RepoCard.jsx';
import RepoInputForm from './components/RepoInputForm.jsx';
import { analyzeRepositories } from './lib/api.js';

const sampleUrls = [
  'https://github.com/facebook/react',
  'https://github.com/nodejs/node',
  'https://github.com/vercel/next.js',
  'https://github.com/tensorflow/tensorflow',
  'https://github.com/kubernetes/kubernetes'
];

const parseInputUrls = (value) =>
  value
    .split(/[\n,]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

const average = (items, key) => {
  if (!items.length) {
    return 0;
  }

  return Math.round(items.reduce((total, item) => total + item[key], 0) / items.length);
};

export default function App() {
  const [input, setInput] = useState(sampleUrls.slice(0, 3).join('\n'));
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState('');

  const summary = useMemo(() => {
    if (!results.length) {
      return null;
    }

    return {
      repositories: results.length,
      averageActivity: average(results, 'activityScore'),
      averageComplexity: average(results, 'complexityScore'),
      advancedCount: results.filter((item) => item.difficulty === 'Advanced').length
    };
  }, [results]);

  const totalRequested = useMemo(() => parseInputUrls(input).length, [input]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const urls = parseInputUrls(input);

    if (!urls.length) {
      setRequestError('Enter at least one GitHub repository URL to analyze.');
      return;
    }

    setLoading(true);
    setRequestError('');

    try {
      const payload = await analyzeRepositories(urls);
      setResults(payload.results || []);
      setErrors(payload.errors || []);
      setMeta(payload.meta || null);
    } catch (error) {
      setRequestError(error.message || 'Analysis failed.');
      setResults([]);
      setErrors([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-16 top-16 h-48 w-48 rounded-full bg-emerald-300/12 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-rose-300/10 blur-3xl animate-float" />

      <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Header />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <RepoInputForm
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onLoadSamples={() => setInput(sampleUrls.join('\n'))}
            loading={loading}
          />

          <aside className="glass-panel flex flex-col justify-between p-6 sm:p-7">
            <div>
              <h2 className="section-title">How the scoring works</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="font-medium text-white">Activity score</p>
                  <p className="mt-2">
                    Commits in the last 30 days, contributor count, and open issues are normalized to 0-100, then weighted 50%, 30%, and 20%.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="font-medium text-white">Complexity score</p>
                  <p className="mt-2">
                    Estimated file count, language diversity, and dependency manifests are normalized to 0-100, then weighted 40%, 30%, and 30%.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="font-medium text-white">Learning difficulty</p>
                  <p className="mt-2">
                    Difficulty score = 70% complexity + 30% activity. Beginner is below 30, Intermediate is 30-70, Advanced is above 70.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="metric-slab">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Queued URLs</p>
                <p className="mt-2 text-2xl font-semibold text-white">{totalRequested}</p>
              </div>
              <div className="metric-slab">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">API token</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Configure on the backend via GITHUB_TOKEN</p>
              </div>
              <div className="metric-slab">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Deploy split</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Frontend on Vercel, backend on Render or Railway</p>
              </div>
            </div>
          </aside>
        </section>

        {requestError ? (
          <section className="rounded-3xl border border-rose-300/15 bg-rose-400/10 px-5 py-4 text-sm text-rose-50">
            {requestError}
          </section>
        ) : null}

        {summary ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="glass-panel p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Repositories analyzed</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{summary.repositories}</p>
            </div>
            <div className="glass-panel p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Average activity</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{summary.averageActivity}</p>
            </div>
            <div className="glass-panel p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Average complexity</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{summary.averageComplexity}</p>
            </div>
            <div className="glass-panel p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Advanced repositories</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{summary.advancedCount}</p>
            </div>
          </section>
        ) : null}

        {errors.length > 0 ? (
          <section className="glass-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Input and analysis errors</h2>
                <p className="mt-2 text-sm text-slate-300">The app keeps successful analyses even when some inputs fail.</p>
              </div>
              {meta ? (
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300">
                  {meta.failed} failures
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-200">
              {errors.map((error) => (
                <span key={`${error.url}-${error.message}`} className="rounded-full border border-rose-300/15 bg-rose-400/10 px-3 py-2">
                  {error.repo ? `${error.repo}: ` : ''}
                  {error.message}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {results.length > 0 ? (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Repository insights</h2>
                <p className="mt-2 text-sm text-slate-300">
                  {meta
                    ? `Generated ${meta.analyzed} analyses with ${meta.cached} cached results.`
                    : 'Detailed repository breakdowns.'}
                </p>
              </div>
            </div>

            {results.map((repository, index) => (
              <RepoCard key={repository.repo} repository={repository} index={index} />
            ))}
          </section>
        ) : (
          <section className="glass-panel grid min-h-64 place-items-center p-8 text-center">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Waiting for analysis</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">Paste repositories and run the analyzer</h2>
              <p className="mt-4 text-sm text-slate-300">
                The dashboard returns stars, forks, issues, contributor counts, language breakdown, and normalized scoring in a structured API-backed view.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}