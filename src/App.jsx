import portfolioData from '../data/portfolio.json';
import strategyRaw from '../content/strategy.md?raw';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PerformanceChart from './components/PerformanceChart';

function StrategySection({ raw }) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const disclaimer = lines.find(l => l.toLowerCase().startsWith('disclaimer'));
  const body = lines.filter(l => l !== disclaimer);

  return (
    <section className="bg-white rounded-xl border border-line p-8 space-y-4">
      <h2 className="font-sans font-semibold text-[16px] text-ink m-0 uppercase tracking-wide">
        Investment Strategy &amp; Process
      </h2>
      {body.map((para, i) => (
        <p key={i} className="font-sans text-[14px] text-ink leading-relaxed m-0">
          {para}
        </p>
      ))}
      {disclaimer && (
        <p className="font-sans text-[11px] text-muted leading-snug border-t border-line pt-4 m-0 italic">
          {disclaimer}
        </p>
      )}
    </section>
  );
}

function App() {
  const { series, metrics: m, last_updated, benchmark_name, inception_date } = portfolioData;

  const fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const fmtNum = (v) => v.toFixed(2);

  return (
    <div className="min-h-screen bg-bg">
      <Header lastUpdated={last_updated} />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-4">

        {/* INR label */}
        <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
          All figures in INR since inception on 2nd Feb 2023
        </p>

        {/* Row 1 — returns & alpha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Annualized Return"
            portfolioValue={fmtPct(m.portfolio_annualised_pct)}
            benchmarkValue={fmtPct(m.benchmark_annualised_pct)}
            benchmarkLabel={benchmark_name}
          />
          <MetricCard
            label="Cumulative Return"
            portfolioValue={fmtPct(m.cumulative_return_pct)}
            benchmarkValue={fmtPct(m.benchmark_cumulative_pct)}
            benchmarkLabel={benchmark_name}
          />
          <MetricCard
            label="Annualized Alpha"
            portfolioValue={fmtPct(m.jensens_alpha_pct)}
            suffix="%"
          />
          <MetricCard
            label="Sharpe Ratio"
            portfolioValue={fmtNum(m.portfolio_sharpe)}
            benchmarkValue={fmtNum(m.benchmark_sharpe)}
            benchmarkLabel={benchmark_name}
            suffix=""
          />
        </div>

        {/* Row 2 — risk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Volatility (Ann.)"
            portfolioValue={m.portfolio_std_dev_pct.toFixed(2)}
            benchmarkValue={m.benchmark_std_dev_pct.toFixed(2)}
            benchmarkLabel={benchmark_name}
            portfolioTone="neutral"
          />
          <MetricCard
            label="Max Drawdown"
            portfolioValue={fmtPct(m.portfolio_max_drawdown_pct)}
            benchmarkValue={fmtPct(m.benchmark_max_drawdown_pct)}
            benchmarkLabel={benchmark_name}
            portfolioTone={m.portfolio_max_drawdown_pct >= m.benchmark_max_drawdown_pct ? 'positive' : 'negative'}
          />
          <MetricCard
            label="Beta"
            portfolioValue={m.beta.toFixed(2)}
            suffix=""
            portfolioTone="neutral"
          />
          <MetricCard
            label="Drawdown Ratio"
            portfolioValue={m.drawdown_ratio.toFixed(2)}
            suffix="×"
            portfolioTone={m.drawdown_ratio <= 1 ? 'positive' : 'negative'}
          />
        </div>

        {/* Chart */}
        <PerformanceChart series={series} benchmarkName={benchmark_name} inceptionDate={inception_date} />

        {/* Strategy & disclaimer — editable via content/strategy.md in GitHub */}
        <StrategySection raw={strategyRaw} />

      </main>
    </div>
  );
}

export default App;
