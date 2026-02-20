import { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { plotMath } from '../services/api';
import { useI18n } from '../i18n/context';

const PLOT_LAYOUT = {
  paper_bgcolor: '#0a0e17',
  plot_bgcolor: '#0a0e17',
  font: { color: '#94a3b8', family: 'Inter', size: 12 },
  margin: { l: 50, r: 30, t: 30, b: 50 },
  xaxis: {
    gridcolor: '#1a2332',
    zerolinecolor: '#2a3444',
    linecolor: '#2a3444',
  },
  yaxis: {
    gridcolor: '#1a2332',
    zerolinecolor: '#2a3444',
    linecolor: '#2a3444',
  },
};

const PRESETS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'x^2', expr: 'x^2' },
  { label: 'e^(-x^2)', expr: 'exp(-x**2)' },
  { label: 'tan(x)', expr: 'tan(x)' },
  { label: '1/x', expr: '1/x' },
  { label: 'log(x)', expr: 'log(x)' },
  { label: 'x*sin(1/x)', expr: 'x*sin(1/x)' },
  { label: 'Gaussian', expr: 'exp(-x**2/2)/sqrt(2*pi)' },
];

const COLORS = ['#6366f1', '#06b6d4', '#a855f7', '#ec4899', '#f97316', '#22c55e'];

export default function Visualization() {
  const { t } = useI18n();
  const [functions, setFunctions] = useState([{ expr: 'sin(x)', data: null }]);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [loading, setLoading] = useState(false);

  const addFunction = () => {
    setFunctions(prev => [...prev, { expr: '', data: null }]);
  };

  const removeFunction = (index) => {
    setFunctions(prev => prev.filter((_, i) => i !== index));
  };

  const updateExpr = (index, expr) => {
    setFunctions(prev => prev.map((f, i) => i === index ? { ...f, expr } : f));
  };

  const plotAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        functions.map(f =>
          f.expr.trim()
            ? plotMath(f.expr, 'x', xMin, xMax).then(r => r.data).catch(() => null)
            : Promise.resolve(null)
        )
      );
      setFunctions(prev =>
        prev.map((f, i) => ({ ...f, data: results[i] }))
      );
    } finally {
      setLoading(false);
    }
  }, [functions, xMin, xMax]);

  const plotData = functions
    .filter(f => f.data)
    .map((f, i) => ({
      x: f.data.x,
      y: f.data.y,
      type: 'scatter',
      mode: 'lines',
      name: f.expr,
      line: { color: COLORS[i % COLORS.length], width: 2.5 },
      connectgaps: false,
    }));

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('viz.title')}</h2>
          <div className="subtitle">{t('viz.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        <div className="split-panel">
          <div>
            <div className="card">
              <div className="card-header">{t('viz.functions')}</div>
              <div className="card-body">
                {functions.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                    <input
                      className="input"
                      value={f.expr}
                      onChange={e => updateExpr(i, e.target.value)}
                      placeholder="e.g. sin(x)"
                      onKeyDown={e => e.key === 'Enter' && plotAll()}
                    />
                    {functions.length > 1 && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeFunction(i)}
                        style={{ padding: '6px 10px', flexShrink: 0 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={addFunction}>
                    {t('viz.addFunction')}
                  </button>
                </div>

                <div className="params-row" style={{ marginTop: 14 }}>
                  <div className="input-group">
                    <label>x min</label>
                    <input
                      className="input"
                      type="number"
                      value={xMin}
                      onChange={e => setXMin(Number(e.target.value))}
                    />
                  </div>
                  <div className="input-group">
                    <label>x max</label>
                    <input
                      className="input"
                      type="number"
                      value={xMax}
                      onChange={e => setXMax(Number(e.target.value))}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={plotAll}
                  disabled={loading}
                  style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                >
                  {loading ? <span className="spinner" /> : t('viz.plot')}
                </button>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">{t('viz.presets')}</div>
              <div className="card-body">
                <div className="btn-group">
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setFunctions([{ expr: p.expr, data: null }]);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card plot-container" style={{ minHeight: 500 }}>
            {plotData.length > 0 ? (
              <Plot
                data={plotData}
                layout={{
                  ...PLOT_LAYOUT,
                  autosize: true,
                  showlegend: plotData.length > 1,
                  legend: { font: { color: '#94a3b8' } },
                }}
                config={{ responsive: true, displayModeBar: true }}
                style={{ width: '100%', height: '100%', minHeight: 500 }}
                useResizeHandler
              />
            ) : (
              <div className="empty-state" style={{ height: 500 }}>
                <div className="empty-icon">📊</div>
                <h3>{t('viz.noData')}</h3>
                <p>{t('viz.noDataDesc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
