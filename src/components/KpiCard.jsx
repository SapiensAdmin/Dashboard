const toneClasses = {
  neutral: 'text-ink',
  positive: 'text-positive',
  negative: 'text-negative',
  accent: 'text-sapiens',
};

export default function KpiCard({ label, value, suffix = '%', tone = 'neutral' }) {
  const numericValue = parseFloat(value);
  const showArrow = suffix === '%';
  const isPositive = numericValue >= 0;
  const arrow = showArrow ? (isPositive ? '▲' : '▼') : null;

  return (
    <div className="bg-white rounded-xl p-6 border border-line transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm">
      <p className="font-sans font-medium text-[12px] text-muted uppercase tracking-wider mb-3">
        {label}
      </p>
      <p className={`font-mono font-medium text-[32px] leading-none ${toneClasses[tone]}`}>
        {arrow && <span className="text-[22px] mr-1">{arrow}</span>}
        {value}{suffix}
      </p>
    </div>
  );
}
