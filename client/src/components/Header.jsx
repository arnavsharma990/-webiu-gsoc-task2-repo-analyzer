export default function Header() {
  return (
    <header className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/45 px-6 py-8 shadow-panel backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(11,211,182,0.22),transparent_58%)] lg:block" />
      <div className="relative max-w-3xl animate-fade-up">
        <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-emerald-200">
          Production-ready GitHub intelligence
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          GitHub Repository Intelligence Analyzer
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Compare repositories by real activity, structural complexity, and learning difficulty from a single dashboard.
        </p>
      </div>
    </header>
  );
}
