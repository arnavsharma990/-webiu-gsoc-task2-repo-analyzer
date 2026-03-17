const tones = {
  emerald: {
    fill: '#10b981',
    glow: 'rgba(16, 185, 129, 0.24)'
  },
  amber: {
    fill: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.24)'
  },
  coral: {
    fill: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.24)'
  }
};

export default function ScoreRing({ label, score, tone = 'emerald' }) {
  const palette = tones[tone] || tones.emerald;
  const background = `conic-gradient(${palette.fill} ${score}%, rgba(148, 163, 184, 0.16) 0)`;

  return (
    <div className="metric-slab flex items-center gap-4">
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{
          background,
          boxShadow: `0 18px 36px ${palette.glow}`
        }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-950/90 text-center">
          <span className="font-display text-xl font-semibold text-white">{score}</span>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{label}</p>
        <p className="mt-2 text-sm text-slate-300">Normalized score on a 0-100 scale.</p>
      </div>
    </div>
  );
}
