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
    <div className="bg-white rounded-xl p-4 md:p-5 border border-line transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm flex flex-col overflow-hidden">
      {/* Fixed-height label row — 2 lines of 11px reserved so all cards align */}
      <div className="h-9 flex items-start">
        <p className="font-sans font-medium text-[10.5px] md:text-[11px] text-muted uppercase tracking-wider leading-[1.3]">
          {label}
        </p>
      </div>

      {/* Portfolio block */}
      <div className="mt-1">
        {isDual && (
          <p className="font-sans text-[10px] md:text-[11px] text-muted leading-none mb-1">
            {portfolioLabel}
          </p>
        )}
        <p className={`font-mono font-semibold text-[20px] md:text-[24px] leading-none tabular-nums ${toneClass[pTone]}`}>
          {portfolioValue}{suffix}
        </p>
      </div>

      {/* Benchmark block — reserved slot even when absent so cards align */}
      <div className="mt-3 min-h-[34px]">
        {isDual && (
          <>
            <p className="font-sans text-[10px] md:text-[11px] text-muted leading-none mb-1">
              {benchmarkLabel}
            </p>
            <p className="font-mono text-[14px] md:text-[16px] text-muted leading-none tabular-nums">
              {benchmarkValue}{suffix}
            </p>
          </>
        )}
      </div>

      {note && (
        <p className="font-sans text-[10px] md:text-[11px] text-muted leading-snug border-t border-line pt-2 mt-3">
          {note}
        </p>
      )}
    </div>
  );
}
