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
    <div className="bg-white rounded-lg border border-line px-4 py-4 md:px-5 md:py-5 flex flex-col overflow-hidden transition-shadow duration-150 hover:shadow-sm">
      {/* Label — fixed 2-line slot so all values sit at the same y */}
      <div className="h-8 md:h-9">
        <p className="font-sans font-medium text-[10px] md:text-[11px] text-muted uppercase tracking-[0.08em] leading-[1.3]">
          {label}
        </p>
      </div>

      {/* Dominant value */}
      <p className={`font-mono font-semibold text-[24px] md:text-[28px] leading-none tabular-nums mt-2 ${toneClass[pTone]}`}>
        {portfolioValue}{suffix}
      </p>

      {/* Comparison line — always reserved for row symmetry */}
      <div className="mt-3 min-h-[16px] flex items-baseline gap-2 min-w-0">
        {isDual && (
          <>
            <span className="font-sans text-[10.5px] md:text-[11px] text-muted uppercase tracking-wider leading-none truncate">
              {benchmarkLabel}
            </span>
            <span className="ml-auto font-mono text-[12px] md:text-[13px] text-ink/70 leading-none tabular-nums shrink-0">
              {benchmarkValue}{suffix}
            </span>
          </>
        )}
      </div>

      {note && (
        <p className="font-sans text-[10px] md:text-[11px] text-muted leading-snug border-t border-line pt-3 mt-3">
          {note}
        </p>
      )}
    </div>
  );
}
