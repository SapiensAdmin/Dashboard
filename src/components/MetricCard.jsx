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
  portfolioValue,
  benchmarkValue,
  suffix = '%',
  portfolioTone,
  benchmarkLabel = 'Benchmark',
}) {
  const isDual = benchmarkValue !== undefined;
  const pTone = portfolioTone ?? inferTone(portfolioValue);

  return (
    <div className="bg-white rounded-lg border border-line p-5 min-h-[140px] flex flex-col justify-between overflow-hidden transition-shadow duration-150 hover:shadow-sm">
      {/* Top: label */}
      <p className="font-sans font-medium text-[11px] text-muted uppercase tracking-[0.08em] leading-[1.3]">
        {label}
      </p>

      {/* Middle: value */}
      <p className={`font-mono font-semibold text-[26px] leading-none tabular-nums mt-3 ${toneClass[pTone]}`}>
        {portfolioValue}{suffix}
      </p>

      {/* Bottom: benchmark line — pinned by justify-between */}
      <div className="mt-3 flex items-baseline gap-2 min-w-0 min-h-[16px]">
        {isDual && (
          <>
            <span className="font-sans text-[11px] text-muted uppercase tracking-wider leading-none truncate">
              {benchmarkLabel}
            </span>
            <span className="ml-auto font-mono text-[13px] text-ink/70 leading-none tabular-nums shrink-0">
              {benchmarkValue}{suffix}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
