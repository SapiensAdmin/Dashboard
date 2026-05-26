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

export default function MetricCard({
  label,
  note,
  portfolioValue,
  benchmarkValue,
  suffix = '%',
  portfolioTone,
  benchmarkLabel = 'Benchmark',
}) {
  const isDual = benchmarkValue !== undefined;
  const pTone = portfolioTone ?? inferTone(portfolioValue);

  return (
    <div className="bg-white rounded-2xl border border-line p-3.5 md:p-5 flex flex-col gap-2.5 md:gap-3 min-w-0 overflow-hidden">

      {/* Label — clamp to 2 lines max, never overflows */}
      <p className="font-sans font-semibold text-[9px] md:text-[10px] text-muted uppercase tracking-widest leading-tight m-0 line-clamp-2">
        {label}
      </p>

      {/* Primary value */}
      <p className={`font-mono font-semibold text-[20px] md:text-[24px] leading-none m-0 truncate ${toneClass[pTone]}`}>
        {portfolioValue}{suffix}
      </p>

      {/* Benchmark comparison */}
      {isDual && (
        <div className="flex items-center justify-between gap-1 border-t border-line pt-2 min-w-0">
          <span className="font-sans text-[9px] text-muted uppercase tracking-wide truncate shrink-0 max-w-[55%]">
            {benchmarkLabel}
          </span>
          <span className="font-mono text-[11px] md:text-[13px] text-muted shrink-0">
            {benchmarkValue}{suffix}
          </span>
        </div>
      )}

      {/* Note — single metrics only, desktop-friendly size */}
      {note && !isDual && (
        <p className="font-sans text-[9px] text-muted leading-snug border-t border-line pt-2 m-0 line-clamp-2">
          {note}
        </p>
      )}
    </div>
  );
}
