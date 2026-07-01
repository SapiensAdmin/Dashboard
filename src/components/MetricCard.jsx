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
    <div className="bg-white rounded-xl p-4 md:p-5 border border-line transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm flex flex-col min-w-0">
      {/* Fixed-height label row so every card's value starts at same y */}
      <div className="h-8 md:h-9 flex items-start">
        <p className="font-sans font-medium text-[10px] md:text-[11px] text-muted uppercase tracking-wider leading-tight">
          {label}
        </p>
      </div>

      {/* Portfolio value — always at same y across cards */}
      <div className="flex items-baseline justify-between gap-2 min-w-0 mt-1">
        {isDual && (
          <span className="font-sans text-[10px] md:text-[11px] text-muted shrink-0">
            {portfolioLabel}
          </span>
        )}
        <span className={`font-mono font-semibold text-[17px] md:text-[22px] leading-none tabular-nums ${toneClass[pTone]}`}>
          {portfolioValue}{suffix}
        </span>
      </div>

      {/* Benchmark value — reserved slot even when absent, so single-value cards align */}
      <div className="flex items-baseline justify-between gap-2 min-w-0 mt-2 h-5">
        {isDual && (
          <>
            <span className="font-sans text-[10px] md:text-[11px] text-muted shrink-0">
              {benchmarkLabel}
            </span>
            <span className="font-mono text-[13px] md:text-[15px] text-muted leading-none tabular-nums">
              {benchmarkValue}{suffix}
            </span>
          </>
        )}
      </div>

      {/* Note — reserved height, only rendered when present */}
      {note && (
        <p className="font-sans text-[10px] md:text-[11px] text-muted leading-snug border-t border-line pt-2 mt-3">
          {note}
        </p>
      )}
    </div>
  );
}
