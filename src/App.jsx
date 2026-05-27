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
    <section className="bg-white rounded-2xl border border-line px-4 py-5 md:px-8 md:py-7">
      <h2 className="font-sans font-semibold text-[10px] md:text-[12px] text-muted uppercase tracking-widest m-0 mb-4">
        Investment Strategy &amp; Process
      </h2>
      <div className="space-y-4">
        {body.map((para, i) => (
          <p key={i} className="font-sans font-normal text-[14px] md:text-[15px] text-ink leading-relaxed m-0">
            {para}
          </p>
        ))}
      </div>
      {disclaimer && (
        <p className="font-sans text-[10px] md:text-[11px] text-muted leading-snug border-t border-line mt-5 pt-4 m-0 italic">
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
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8 space-y-2.5 md:space-y-4">

        {/* Row 1 — returns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <MetricCard
            label="Annualised Return"
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
            label="Alpha (Ann.)"
            portfolioValue={fmtPct(m.jensens_alpha_pct)}
            suffix="%"
            note={`Jensen's α · Rf = ${m.rf_rate_pct}%`}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <MetricCard
            label="Std Deviation"
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
            note={`Corr ${m.correlation.toFixed(2)} · vs ${benchmark_name}`}
          />
          <MetricCard
            label="Drawdown Ratio"
            portfolioValue={m.drawdown_ratio.toFixed(2)}
            suffix="×"
            portfolioTone={m.drawdown_ratio <= 1 ? 'positive' : 'negative'}
            note="Portfolio ÷ Benchmark MDD"
          />
        </div>

        {/* Chart */}
        <PerformanceChart
          series={series}
          benchmarkName={benchmark_name}
          inceptionDate={inception_date}
        />

        {/* Strategy */}
        <StrategySection raw={strategyRaw} />

      </main>
    </div>
  );
}

export default App;
