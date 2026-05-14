import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatMonthYear } from '../lib/format';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-line rounded-lg px-4 py-3 shadow-sm">
      <p className="font-sans text-[12px] text-muted mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono text-[13px]" style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export default function PerformanceChart({ series, benchmarkName }) {
  const tickEvery = Math.max(1, Math.floor(series.length / 18));

  const ticks = series
    .filter((_, i) => i % tickEvery === 0)
    .map((d) => d.date);

  return (
    <div className="bg-white rounded-xl p-6 border border-line" style={{ height: '420px' }}>
      <h2 className="font-sans font-semibold text-[16px] text-ink mb-4 m-0">
        Portfolio vs {benchmarkName}
      </h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={series} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={formatMonthYear}
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => v.toFixed(0)}
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontFamily: 'Inter', fontSize: '13px', paddingTop: '8px' }}
          />
          <Line
            type="monotone"
            dataKey="portfolio"
            name="Portfolio"
            stroke="#1f4ea8"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            name={benchmarkName}
            stroke="#1a1a1a"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
