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
  portfolioLabel = 'Portfolio',
}) {
  const isDual = benchmarkValue !== undefined;
  const pTone = portfolioTone ?? inferTone(portfolioValue);

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 border border-line transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm flex flex-col gap-2 md:gap-3 overflow-hidden min-w-0">
      <p className="font-sans font-medium text-[10px] md:text-[11px] text-muted uppercase tracking-wider leading-tight line-clamp-2">
        {label}
      </p>

      <div className="flex flex-col gap-1 md:gap-1.5 min-w-0">
        {/* Portfolio row */}
        <div className="flex items-baseline justify-between gap-1 min-w-0">
          {isDual && (
            <span className="font-sans text-[10px] md:text-[11px] text-muted shrink-0">{portfolioLabel}</span>
          )}
          <span className={`font-mono font-semibold text-[17px] md:text-[22px] leading-none truncate text-right ${toneClass[pTone]}`}>
            {portfolioValue}{suffix}
          </span>
        </div>

        {/* Benchmark row */}
        {isDual && (
          <div className="flex items-baseline justify-between gap-1 min-w-0">
            <span className="font-sans text-[10px] md:text-[11px] text-muted shrink-0 max-w-[52%] truncate">{benchmarkLabel}</span>
            <span className="font-mono text-[13px] md:text-[15px] text-muted leading-none">
              {benchmarkValue}{suffix}
            </span>
          </div>
        )}
      </div>

      {note && (
        <p className="font-sans text-[10px] md:text-[11px] text-muted leading-snug border-t border-line pt-2">
          {note}
        </p>
      )}
    </div>
  );
}
