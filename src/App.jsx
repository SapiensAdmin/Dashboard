import portfolioData from '../data/portfolio.json';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import PerformanceChart from './components/PerformanceChart';

function App() {
  const { series, metrics, last_updated, benchmark_name } = portfolioData;

  return (
    <div className="min-h-screen bg-bg">
      <Header lastUpdated={last_updated} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Portfolio Index"
            value={metrics.current_portfolio_index.toFixed(2)}
            suffix=""
            tone="accent"
          />
          <KpiCard
            label="Cumulative Return"
            value={metrics.cumulative_return_pct.toFixed(2)}
            suffix="%"
            tone={metrics.cumulative_return_pct >= 0 ? 'positive' : 'negative'}
          />
          <KpiCard
            label={`${benchmark_name} Return`}
            value={metrics.benchmark_return_pct.toFixed(2)}
            suffix="%"
            tone="neutral"
          />
          <KpiCard
            label="Alpha"
            value={metrics.alpha_pct.toFixed(2)}
            suffix="%"
            tone={metrics.alpha_pct >= 0 ? 'positive' : 'negative'}
          />
        </div>
        <PerformanceChart series={series} benchmarkName={benchmark_name} />
      </main>
    </div>
  );
}

export default App;
