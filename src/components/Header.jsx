import StatusDot from './StatusDot';

export default function Header({ lastUpdated }) {
  return (
    <header className="w-full bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-0 md:h-20 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Sapiens Alpha" className="h-8 md:h-12 w-auto shrink-0" />
          <div className="flex flex-col">
            <h1 className="font-sans font-semibold text-[15px] md:text-[18px] text-ink leading-tight m-0">
              Fund of Funds
            </h1>
            <span className="font-sans font-normal text-[11px] md:text-[13px] text-muted leading-tight">
              Live Performance Dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <StatusDot lastUpdated={lastUpdated} />
          <span className="font-mono text-[11px] md:text-[13px] text-muted">Updated: {lastUpdated}</span>
        </div>
      </div>
    </header>
  );
}
