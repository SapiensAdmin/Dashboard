import portfolioData from '../data/portfolio.json';
import strategyRaw from '../content/strategy.md?raw';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PerformanceChart from './components/PerformanceChart';

// Parse strategy.md into sections for rendering
function parseStrategy(raw) {
  const lines = raw.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith('# ')) {
      // top-level title — skip, we render it separately
    } else if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { heading: line.replace('## ', ''), paras: [] };
    } else if (line.startsWith('---')) {
      if (current) sections.push(current);
      current = { heading: null, paras: [] };
    } else if (line.trim()) {
      if (!current) current = { heading: null, paras: [] };
      current.paras.push(line.trim());
    }
  }
  if (current) sections.push(current);
  return sections;
}

// Bold text between **...**
function renderBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : p
  );
}

function StrategySection({ raw }) {
  const title = raw.split('\n')[0].replace('# ', '');
  const sections = parseStrategy(raw);
  const disclaimer = sections.find(s => !s.heading && s.paras.some(p => p.startsWith('*Disclaimer')));
  const bodySections = sections.filter(s => s !== disclaimer && (s.heading || s.paras.length));

  return (
    <section className="bg-white rounded-xl border border-line p-8 space-y-6">
      <h2 className="font-sans font-semibold text-[18px] text-ink m-0">{title}</h2>
      {bodySections.map((s, i) => (
        <div key={i} className="space-y-2">
          {s.heading && (
            <h3 className="font-sans font-semibold text-[14px] text-ink uppercase tracking-wide m-0">
              {s.heading}
            </h3>
          )}
          {s.paras.map((p, j) => (
            <p key={j} className="font-sans text-[14px] text-ink leading-relaxed m-0">
              {renderBold(p)}
            </p>
          ))}
        </div>
      ))}
      {disclaimer && disclaimer.paras.map((p, i) => (
        <p key={i} className="font-sans text-[11px] text-muted leading-snug border-t border-line pt-4 m-0 italic">
          {p.replace(/^\*/, '').replace(/\*$/, '')}
        </p>
      ))}
    </section>
  );
}

function App() {
  const { series, metrics: m, last_updated, benchmark_name } = portfolioData;

  const fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2);
  const fmtNum = (v) => v.toFixed(2);

  return (
    <div className="min-h-screen bg-bg">
      <Header lastUpdated={last_updated} />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-4">

        {/* Row 1 — returns & alpha */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Row 2 — risk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            note={`Correlation: ${m.correlation.toFixed(2)}. OLS regression of daily returns vs ${benchmark_name}.`}
          />
          <MetricCard
            label="Drawdown Ratio"
            portfolioValue={m.drawdown_ratio.toFixed(2)}
            suffix="×"
            portfolioTone={m.drawdown_ratio <= 1 ? 'positive' : 'negative'}
            note="Portfolio MDD ÷ Benchmark MDD. Below 1× means shallower drawdown."
          />
        </div>

        {/* Chart */}
        <PerformanceChart series={series} benchmarkName={benchmark_name} />

        {/* Strategy & disclaimer — editable via content/strategy.md in GitHub */}
        <StrategySection raw={strategyRaw} />

      </main>
    </div>
  );
}

export default App;
