import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const palette = ['#0bd3b6', '#4ade80', '#f7b955', '#f5826b', '#38bdf8', '#c084fc'];

const formatNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
});

const buildLanguageData = (languages) => {
  const entries = Object.entries(languages || {}).sort((left, right) => right[1] - left[1]);

  if (!entries.length) {
    return [];
  }

  const topFive = entries.slice(0, 5).map(([name, value]) => ({
    name,
    value
  }));

  const remainder = entries.slice(5).reduce((total, [, value]) => total + value, 0);

  if (remainder > 0) {
    topFive.push({
      name: 'Other',
      value: remainder
    });
  }

  return topFive;
};

export default function LanguageChart({ languages }) {
  const data = buildLanguageData(languages);

  return (
    <div className="metric-slab h-[320px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">Language distribution</h3>
          <p className="mt-1 text-sm text-slate-400">Top languages reported by the GitHub REST API.</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="grid h-[240px] place-items-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
          No language data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={66}
              outerRadius={92}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#081120',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px'
              }}
              formatter={(value) => formatNumber.format(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
          {data.map((entry, index) => (
            <span key={entry.name} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              {entry.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
