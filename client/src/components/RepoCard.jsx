import ActivityChart from './ActivityChart.jsx';
import LanguageChart from './LanguageChart.jsx';
import MetricPill from './MetricPill.jsx';
import ScoreRing from './ScoreRing.jsx';

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
});

const difficultyStyles = {
  Beginner: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
  Intermediate: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
  Advanced: 'border-rose-300/20 bg-rose-400/10 text-rose-100'
};

export default function RepoCard({ repository, index }) {
  const warningCount = repository.warnings?.length || 0;
  const difficultyStyle = difficultyStyles[repository.difficulty] || difficultyStyles.Intermediate;

  return (
    <article
      className="glass-panel animate-fade-up p-6 sm:p-7"
      style={{ animationDelay: `${Math.min(index * 100, 400)}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Repository</p>
          <a
            href={repository.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex font-display text-2xl font-semibold tracking-tight text-white transition hover:text-emerald-200"
          >
            {repository.repo}
          </a>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            {repository.description || 'No public description is available for this repository.'}
          </p>
        </div>

        <div className={`rounded-full border px-4 py-2 text-sm font-medium ${difficultyStyle}`}>
          {repository.difficulty} difficulty
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPill label="Stars" value={compactNumber.format(repository.stars)} />
        <MetricPill label="Forks" value={compactNumber.format(repository.forks)} />
        <MetricPill label="Open issues" value={compactNumber.format(repository.openIssues)} />
        <MetricPill label="Files (est.)" value={compactNumber.format(repository.fileCountEstimate)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.95fr)_minmax(0,1.1fr)]">
        <ScoreRing label="Activity score" score={repository.activityScore} tone="emerald" />
        <ScoreRing label="Complexity score" score={repository.complexityScore} tone="amber" />

        <div className="metric-slab">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Learning difficulty</p>
              <p className="mt-2 font-display text-2xl font-semibold text-white">{repository.difficultyScore}/100</p>
            </div>
            <div className={`rounded-full border px-3 py-1.5 text-sm ${difficultyStyle}`}>{repository.difficulty}</div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dependencies detected</p>
              <p className="mt-2 text-sm text-slate-200">
                {repository.dependencyFiles.length > 0 ? repository.dependencyFiles.join(', ') : 'No common dependency manifest found'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Coverage</p>
              <p className="mt-2 text-sm text-slate-200">
                {repository.languageCount} languages • {repository.contributors} contributors • {repository.commitsLast30Days} recent commits
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <LanguageChart languages={repository.languages} />
        <ActivityChart repository={repository} />
      </div>

      {warningCount > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/8 px-4 py-4 text-sm text-amber-50">
          <p className="font-medium text-amber-100">Analysis notes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {repository.warnings.map((warning) => (
              <span key={warning} className="rounded-full border border-amber-200/15 px-3 py-1.5 text-xs text-amber-50/90">
                {warning}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
