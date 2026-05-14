import portfolioData from '../data/portfolio.json';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PerformanceChart from './components/PerformanceChart';

function App() {
  const { series, metrics: m, last_updated, benchmark_name } = portfolioData;

  const fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const fmtNum = (v) => v.toFixed(2);

  return (
    <div className="min-h-screen bg-bg">
      <Header lastUpdated={last_updated} />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-4">

        {/* Row 1 — return & risk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Cumulative Return"
            portfolioValue={fmtPct(m.cumulative_return_pct)}
            benchmarkValue={fmtPct(m.benchmark_cumulative_pct)}
            benchmarkLabel={benchmark_name}
          />
          <MetricCard
            label="Annualised Return (CAGR)"
            portfolioValue={fmtPct(m.portfolio_annualised_pct)}
            benchmarkValue={fmtPct(m.benchmark_annualised_pct)}
            benchmarkLabel={benchmark_name}
          />
          <MetricCard
            label="Annualised Volatility"
            portfolioValue={m.portfolio_volatility_pct.toFixed(2)}
            benchmarkValue={m.benchmark_volatility_pct.toFixed(2)}
            benchmarkLabel={benchmark_name}
            portfolioTone="neutral"
          />
          <MetricCard
            label="Sharpe Ratio"
            portfolioValue={fmtNum(m.portfolio_sharpe)}
            benchmarkValue={fmtNum(m.benchmark_sharpe)}
            benchmarkLabel={benchmark_name}
            suffix=""
          />
        </div>

        {/* Row 2 — drawdown & alpha */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Maximum Drawdown"
            portfolioValue={fmtPct(m.portfolio_max_drawdown_pct)}
            benchmarkValue={fmtPct(m.benchmark_max_drawdown_pct)}
            benchmarkLabel={benchmark_name}
            portfolioTone={m.portfolio_max_drawdown_pct <= m.benchmark_max_drawdown_pct ? 'positive' : 'negative'}
          />
          <MetricCard
            label="Drawdown Ratio"
            portfolioValue={m.drawdown_ratio.toFixed(2)}
            suffix="×"
            portfolioTone={m.drawdown_ratio <= 1 ? 'positive' : 'negative'}
            note="Portfolio MDD ÷ Benchmark MDD. Below 1× means shallower drawdown."
          />
          <MetricCard
            label="Jensen's Alpha (ann.)"
            portfolioValue={fmtPct(m.jensens_alpha_pct)}
            suffix="%"
            note={`α = Rp − [Rf + β·(Rm − Rf)]. Rf = ${m.rf_rate_pct}% (10-yr G-Sec)`}
          />
          <MetricCard
            label="Beta · Correlation"
            portfolioValue={`${m.beta.toFixed(2)} · ${m.correlation.toFixed(2)}`}
            suffix=""
            portfolioTone="neutral"
            note="OLS regression of daily portfolio returns vs benchmark."
          />
        </div>

        {/* Chart */}
        <PerformanceChart series={series} benchmarkName={benchmark_name} />
      </main>
    </div>
  );
}

export default App;
