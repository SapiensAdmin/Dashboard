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
    <div className="bg-white border border-line rounded-lg px-3 py-2 shadow-sm">
      <p className="font-sans text-[11px] text-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono text-[12px]" style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export default function PerformanceChart({ series, benchmarkName, inceptionDate }) {
  // Thin ticks more aggressively on small screens via a lower cap
  const tickEvery = Math.max(1, Math.floor(series.length / 12));

  const ticks = series
    .filter((_, i) => i % tickEvery === 0)
    .map((d) => d.date);

  return (
    <div className="bg-white rounded-xl border border-line flex flex-col">
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2">
        <h2 className="font-sans font-semibold text-[14px] md:text-[16px] text-ink m-0">
          Portfolio vs {benchmarkName}
        </h2>
      </div>

      {/* Chart */}
      <div className="h-56 sm:h-72 md:h-96 px-1 md:px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={formatMonthYear}
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(v) => v.toFixed(0)}
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px', paddingTop: '4px' }}
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

      {/* INR note below chart */}
      <p className="font-sans text-[10px] md:text-[11px] text-muted px-4 md:px-6 pb-4 pt-1 m-0">
        Returns in INR terms · Portfolio indexed to 100 at inception ({inceptionDate}) · {benchmarkName} shown for comparison
      </p>
    </div>
  );
}
