import StatusDot from './StatusDot';

export default function Header({ lastUpdated }) {
  return (
    <header className="w-full bg-white border-b border-line" style={{ minHeight: '80px' }}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <img src="/logo.svg" alt="Sapiens Alpha" className="h-9 md:h-12 w-auto shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="font-sans font-semibold text-[14px] md:text-[17px] text-ink leading-tight m-0 tracking-tight whitespace-nowrap">
              Fund of Funds
            </h1>
            <span className="font-sans font-normal text-[9.5px] md:text-[11px] text-muted leading-tight tracking-wider uppercase whitespace-nowrap">
              Performance Dashboard
            </span>
          </div>
        </div>

        {/* Right: status + date */}
        <div className="flex flex-col items-end gap-0.5 md:flex-row md:items-center md:gap-3">
          <StatusDot lastUpdated={lastUpdated} />
          <span className="font-mono text-[9px] md:text-[12px] text-muted">{lastUpdated}</span>
        </div>
      </div>
    </header>
  );
}
