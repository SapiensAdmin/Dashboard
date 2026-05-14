export default function StatusDot({ lastUpdated }) {
  const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const isLive = lastUpdated === todayIST;

  return (
    <div className="flex items-center gap-1.5">
      {isLive ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-live" />
          </span>
          <span className="font-mono text-[13px] text-live">Live</span>
        </>
      ) : (
        <>
          <span className="inline-flex rounded-full h-2.5 w-2.5 bg-stale" />
          <span className="font-mono text-[13px] text-stale">Stale</span>
        </>
      )}
    </div>
  );
}
