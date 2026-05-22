const toneClass = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-ink',
};

function inferTone(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return 'neutral';
  return n >= 0 ? 'positive' : 'negative';
}

// Dual mode: portfolio + benchmark pair
// Single mode: one headline value + optional note
export default function MetricCard({
  label,
  note,
  portfolioValue,
  benchmarkValue,
  suffix = '%',
  portfolioTone,
  benchmarkLabel = 'Benchmark',
  portfolioLabel = 'Portfolio',
}) {
  const isDual = benchmarkValue !== undefined;
  const pTone = portfolioTone ?? inferTone(portfolioValue);

  return (
    <div className="bg-white rounded-xl p-5 border border-line transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm flex flex-col gap-3">
      <p className="font-sans font-medium text-[11px] text-muted uppercase tracking-wider leading-none">
        {label}
      </p>

      <div className="flex flex-col gap-1.5">
        {/* Portfolio row */}
        <div className="flex items-baseline justify-between">
          {isDual && (
            <span className="font-sans text-[11px] text-muted w-20 shrink-0">{portfolioLabel}</span>
          )}
          <span className={`font-mono font-semibold text-[22px] leading-none ${toneClass[pTone]}`}>
            {portfolioValue}{suffix}
          </span>
        </div>

        {/* Benchmark row */}
        {isDual && (
          <div className="flex items-baseline justify-between">
            <span className="font-sans text-[11px] text-muted w-20 shrink-0">{benchmarkLabel}</span>
            <span className="font-mono text-[15px] text-muted leading-none">
              {benchmarkValue}{suffix}
            </span>
          </div>
        )}
      </div>

      {note && (
        <p className="font-sans text-[11px] text-muted leading-snug border-t border-line pt-2">
          {note}
        </p>
      )}
    </div>
  );
}
