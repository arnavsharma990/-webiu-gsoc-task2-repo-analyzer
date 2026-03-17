const exampleUrls = [
  'https://github.com/facebook/react',
  'https://github.com/nodejs/node',
  'https://github.com/vercel/next.js',
  'https://github.com/tensorflow/tensorflow',
  'https://github.com/kubernetes/kubernetes'
];

export default function RepoInputForm({ value, onChange, onSubmit, onLoadSamples, loading }) {
  return (
    <section className="glass-panel p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="section-title">Analyze repositories</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Paste GitHub URLs separated by new lines or commas. The API deduplicates repeats and returns per-repository errors when only some inputs fail.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSamples}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-300/40 hover:bg-white/[0.04]"
        >
          Load sample repos
        </button>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">GitHub repository URLs</span>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-56 w-full rounded-[24px] border border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/35 focus:ring-2 focus:ring-emerald-300/15"
            placeholder={exampleUrls.join('\n')}
            spellCheck="false"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <p>Tip: use a GitHub personal access token on the backend for reliable rate limits.</p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-w-40 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Analyzing...' : 'Analyze repositories'}
          </button>
        </div>
      </form>
    </section>
  );
}
