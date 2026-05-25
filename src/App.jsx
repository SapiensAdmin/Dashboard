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
    <section className="bg-white rounded-xl border border-line p-5 md:p-8 space-y-3 md:space-y-4">
      <h2 className="font-sans font-semibold text-[13px] md:text-[16px] text-ink m-0 uppercase tracking-wide">
        Investment Strategy &amp; Process
      </h2>
      {body.map((para, i) => (
        <p key={i} className="font-sans font-normal text-[12px] md:text-[13px] text-ink leading-relaxed tracking-normal m-0">
          {para}
        </p>
      ))}
      {disclaimer && (
        <p className="font-sans font-normal text-[10px] md:text-[11px] text-muted leading-snug border-t border-line pt-3 md:pt-4 m-0 italic">
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
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8 space-y-3 md:space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <MetricCard
            label="Annualized Return (Gross)"
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
            label="Alpha (Annualized)"
            portfolioValue={fmtPct(m.jensens_alpha_pct)}
            suffix="%"
            note={`Jensen's α = Rp − [Rf + β·(Rm − Rf)]. Rf = ${m.rf_rate_pct}%`}
          />
          <MetricCard
            label="Sharpe Ratio"
            portfolioValue={fmtNum(m.portfolio_sharpe)}
            benchmarkValue={fmtNum(m.benchmark_sharpe)}
            benchmarkLabel={benchmark_name}
            suffix=""
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <MetricCard
            label="Standard Deviation (ann.)"
            portfolioValue={m.portfolio_std_dev_pct.toFixed(2)}
            benchmarkValue={m.benchmark_std_dev_pct.toFixed(2)}
            benchmarkLabel={benchmark_name}
            portfolioTone="neutral"
          />
          <MetricCard
            label="Maximum Drawdown"
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
            note={`Correlation: ${m.correlation.toFixed(2)}. OLS regression vs ${benchmark_name}.`}
          />
          <MetricCard
            label="Drawdown Ratio"
            portfolioValue={m.drawdown_ratio.toFixed(2)}
            suffix="×"
            portfolioTone={m.drawdown_ratio <= 1 ? 'positive' : 'negative'}
            note="Portfolio MDD ÷ Benchmark MDD. Below 1× = shallower drawdown."
          />
        </div>

        <PerformanceChart
          series={series}
          benchmarkName={benchmark_name}
          inceptionDate={inception_date}
        />

        <StrategySection raw={strategyRaw} />

      </main>
    </div>
  );
}

export default App;
