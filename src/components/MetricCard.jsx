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
    <div className="bg-white rounded-xl p-4 md:p-5 border border-line transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm flex flex-col gap-3 md:gap-4 min-w-0">
      <p className="font-sans font-medium text-[10px] md:text-[11px] text-muted uppercase tracking-wider leading-tight">
        {label}
      </p>

      <div className="flex flex-col gap-2 min-w-0">
        {/* Portfolio */}
        <div className="flex flex-col gap-0.5 min-w-0">
          {isDual && (
            <span className="font-sans text-[10px] md:text-[11px] text-muted leading-none">
              {portfolioLabel}
            </span>
          )}
          <span className={`font-mono font-semibold text-[18px] md:text-[22px] leading-tight tabular-nums ${toneClass[pTone]}`}>
            {portfolioValue}{suffix}
          </span>
        </div>

        {/* Benchmark */}
        {isDual && (
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-sans text-[10px] md:text-[11px] text-muted leading-none">
              {benchmarkLabel}
            </span>
            <span className="font-mono text-[14px] md:text-[16px] text-muted leading-tight tabular-nums">
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
