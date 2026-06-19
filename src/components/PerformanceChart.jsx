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
    <div className="bg-white border border-line rounded-xl px-3 py-2.5 shadow-md">
      <p className="font-sans text-[10px] text-muted mb-1.5 uppercase tracking-wide">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono text-[12px] leading-snug" style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export default function PerformanceChart({ series, benchmarkName, inceptionDate }) {
  const tickEvery = Math.max(1, Math.floor(series.length / 10));
  const ticks = series.filter((_, i) => i % tickEvery === 0).map((d) => d.date);

  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 pt-5 md:pt-6 pb-1">
        <h2 className="font-sans font-semibold text-[13px] md:text-[15px] text-ink m-0 tracking-tight">
          Portfolio vs {benchmarkName}
        </h2>
        <p className="font-sans text-[9px] md:text-[10px] text-muted mt-0.5 m-0">
          Indexed to 100 at inception ({inceptionDate}) · INR terms
        </p>
      </div>

      {/* Chart — explicit inline style avoids the flex-child height bug */}
      <div style={{ height: 'clamp(200px, 45vw, 380px)' }} className="px-2 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={formatMonthYear}
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(v) => v.toFixed(0)}
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: 'Inter', fontSize: '11px', paddingTop: '4px', paddingLeft: '8px' }}
            />
            <Line
              type="monotone"
              dataKey="portfolio"
              name="Portfolio"
              stroke="#1f4ea8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              name={benchmarkName}
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer note */}
      <div className="px-4 md:px-6 pb-4 pt-0">
        <p className="font-sans text-[9px] md:text-[10px] text-muted m-0">
          BSE 500 shown for comparison only. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
