import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const formatNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export default function ActivityChart({ repository }) {
  const data = [
    {
      label: 'Commits 30d',
      value: repository.commitsLast30Days
    },
    {
      label: 'Contributors',
      value: repository.contributors
    },
    {
      label: 'Open issues',
      value: repository.openIssues
    }
  ];

  return (
    <div className="metric-slab h-[320px]">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-white">Activity signals</h3>
        <p className="mt-1 text-sm text-slate-400">Raw metrics behind the activity score.</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={10}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickFormatter={(value) => formatNumber.format(value)} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
            contentStyle={{
              backgroundColor: '#081120',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px'
            }}
            formatter={(value) => formatNumber.format(value)}
          />
          <Bar dataKey="value" fill="#0bd3b6" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
