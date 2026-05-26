import StatusDot from './StatusDot';

export default function Header({ lastUpdated }) {
  return (
    <header className="w-full bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-0 md:h-20 flex items-center justify-between">
        {/* Left: logo + title */}
        <div className="flex items-center gap-2.5 md:gap-3">
          <img src="/logo.svg" alt="Sapiens Alpha" className="h-7 md:h-11 w-auto shrink-0" />
          <div className="flex flex-col">
            <h1 className="font-sans font-semibold text-[13px] md:text-[17px] text-ink leading-tight m-0 tracking-tight">
              Fund of Funds
            </h1>
            <span className="font-sans font-normal text-[10px] md:text-[12px] text-muted leading-tight tracking-wide uppercase">
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
