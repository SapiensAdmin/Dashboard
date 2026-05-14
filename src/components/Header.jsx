import StatusDot from './StatusDot';

export default function Header({ lastUpdated }) {
  return (
    <header className="w-full bg-white border-b border-line" style={{ minHeight: '80px' }}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/Sapiens_Blue_Stacked_Logo.png" alt="Sapiens Alpha" className="h-12 w-auto" />
          <div className="flex flex-col">
            <h1 className="font-sans font-semibold text-[18px] text-ink leading-tight m-0">
              Fund of Funds
            </h1>
            <span className="font-sans font-normal text-[13px] text-muted leading-tight">
              Live Performance Dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot lastUpdated={lastUpdated} />
          <span className="font-mono text-[13px] text-muted">Updated: {lastUpdated}</span>
        </div>
      </div>
    </header>
  );
}
