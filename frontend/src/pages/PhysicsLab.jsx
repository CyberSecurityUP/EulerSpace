import { useState } from 'react';
import Plot from 'react-plotly.js';
import { useI18n } from '../i18n/context';
import {
  simulateProjectile, simulateSHM, simulatePendulum,
  simulateWave, simulateElectricField, simulateOrbital,
} from '../services/api';

const PLOT_LAYOUT = {
  paper_bgcolor: '#0a0e17',
  plot_bgcolor: '#0a0e17',
  font: { color: '#94a3b8', family: 'Inter', size: 12 },
  margin: { l: 50, r: 30, t: 30, b: 50 },
  xaxis: { gridcolor: '#1a2332', zerolinecolor: '#2a3444' },
  yaxis: { gridcolor: '#1a2332', zerolinecolor: '#2a3444' },
};

export default function PhysicsLab() {
  const { t } = useI18n();
  const [sim, setSim] = useState('projectile');
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SIMS = [
    { id: 'projectile', label: t('physics.projectile'), icon: '🎯' },
    { id: 'shm', label: t('physics.shm'), icon: '〰' },
    { id: 'pendulum', label: t('physics.pendulum'), icon: '🔔' },
    { id: 'wave', label: t('physics.wave'), icon: '🌊' },
    { id: 'efield', label: t('physics.eField'), icon: '⚡' },
    { id: 'orbital', label: t('physics.orbital'), icon: '🪐' },
  ];

  const p = (key, def) => params[key] ?? def;
  const set = (key, val) => setParams(prev => ({ ...prev, [key]: val }));

  const runSimulation = async () => {
    setLoading(true);
    try {
      let res;
      switch (sim) {
        case 'projectile':
          res = await simulateProjectile(p('v0', 50), p('angle', 45), p('g', 9.81));
          break;
        case 'shm':
          res = await simulateSHM(p('amplitude', 1), p('omega', 2), p('phi', 0), p('t_max', 10));
          break;
        case 'pendulum':
          res = await simulatePendulum(p('length', 1), p('theta0', 30), p('g', 9.81), p('t_max', 10));
          break;
        case 'wave':
          res = await simulateWave(p('waveLength', 1), p('c', 1), p('n_modes', 5));
          break;
        case 'efield':
          res = await simulateElectricField(p('charges', [
            { x: -2, y: 0, q: 1e-6 },
            { x: 2, y: 0, q: -1e-6 },
          ]));
          break;
        case 'orbital':
          res = await simulateOrbital({ t_years: p('t_years', 1) });
          break;
        default: break;
      }
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderParams = () => {
    switch (sim) {
      case 'projectile':
        return (
          <div className="params-row">
            <div className="input-group">
              <label>{t('physics.initVelocity')}</label>
              <input className="input" type="number" value={p('v0', 50)}
                onChange={e => set('v0', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>{t('physics.angle')}</label>
              <input className="input" type="number" value={p('angle', 45)}
                onChange={e => set('angle', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>{t('physics.gravity')}</label>
              <input className="input" type="number" value={p('g', 9.81)} step={0.01}
                onChange={e => set('g', Number(e.target.value))} />
            </div>
          </div>
        );
      case 'shm':
        return (
          <div className="params-row">
            <div className="input-group">
              <label>{t('physics.amplitude')}</label>
              <input className="input" type="number" value={p('amplitude', 1)} step={0.1}
                onChange={e => set('amplitude', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>{t('physics.omega')}</label>
              <input className="input" type="number" value={p('omega', 2)} step={0.1}
                onChange={e => set('omega', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>{t('physics.phase')}</label>
              <input className="input" type="number" value={p('phi', 0)} step={0.1}
                onChange={e => set('phi', Number(e.target.value))} />
            </div>
          </div>
        );
      case 'pendulum':
        return (
          <div className="params-row">
            <div className="input-group">
              <label>{t('physics.length')}</label>
              <input className="input" type="number" value={p('length', 1)} step={0.1}
                onChange={e => set('length', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>{t('physics.initAngle')}</label>
              <input className="input" type="number" value={p('theta0', 30)}
                onChange={e => set('theta0', Number(e.target.value))} />
            </div>
          </div>
        );
      case 'wave':
        return (
          <div className="params-row">
            <div className="input-group">
              <label>{t('physics.stringLength')}</label>
              <input className="input" type="number" value={p('waveLength', 1)} step={0.1}
                onChange={e => set('waveLength', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>{t('physics.waveSpeed')}</label>
              <input className="input" type="number" value={p('c', 1)} step={0.1}
                onChange={e => set('c', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>{t('physics.modes')}</label>
              <input className="input" type="number" value={p('n_modes', 5)} min={1} max={20}
                onChange={e => set('n_modes', Number(e.target.value))} />
            </div>
          </div>
        );
      case 'orbital':
        return (
          <div className="params-row">
            <div className="input-group">
              <label>{t('physics.simTime')}</label>
              <input className="input" type="number" value={p('t_years', 1)} step={0.1}
                onChange={e => set('t_years', Number(e.target.value))} />
            </div>
          </div>
        );
      case 'efield':
        return (
          <div className="input-group">
            <label>{t('physics.charges')}</label>
            <input
              className="input"
              value={p('chargesStr', '[{"x":-2,"y":0,"q":1e-6},{"x":2,"y":0,"q":-1e-6}]')}
              onChange={e => {
                set('chargesStr', e.target.value);
                try { set('charges', JSON.parse(e.target.value)); } catch {}
              }}
            />
          </div>
        );
      default: return null;
    }
  };

  const renderPlot = () => {
    if (!result) return null;

    switch (sim) {
      case 'projectile':
        return (
          <div>
            <Plot
              data={[{
                x: result.x, y: result.y, type: 'scatter', mode: 'lines',
                line: { color: '#6366f1', width: 2.5 }, name: 'Trajectory',
              }]}
              layout={{ ...PLOT_LAYOUT, xaxis: { ...PLOT_LAYOUT.xaxis, title: 'x (m)' },
                yaxis: { ...PLOT_LAYOUT.yaxis, title: 'y (m)' }, autosize: true }}
              config={{ responsive: true }}
              style={{ width: '100%', height: 400 }}
              useResizeHandler
            />
            <div className="grid-3" style={{ marginTop: 12 }}>
              <div className="result-box">
                <div className="result-label">{t('physics.maxHeight')}</div>
                <div className="result-value">{result.max_height?.toFixed(2)} m</div>
              </div>
              <div className="result-box">
                <div className="result-label">{t('physics.range')}</div>
                <div className="result-value">{result.range?.toFixed(2)} m</div>
              </div>
              <div className="result-box">
                <div className="result-label">{t('physics.flightTime')}</div>
                <div className="result-value">{result.flight_time?.toFixed(2)} s</div>
              </div>
            </div>
          </div>
        );

      case 'shm':
        return (
          <Plot
            data={[
              { x: result.t, y: result.position, type: 'scatter', mode: 'lines',
                line: { color: '#6366f1', width: 2 }, name: 'Position' },
              { x: result.t, y: result.velocity, type: 'scatter', mode: 'lines',
                line: { color: '#06b6d4', width: 2 }, name: 'Velocity' },
            ]}
            layout={{ ...PLOT_LAYOUT, showlegend: true,
              xaxis: { ...PLOT_LAYOUT.xaxis, title: 't (s)' }, autosize: true }}
            config={{ responsive: true }}
            style={{ width: '100%', height: 450 }}
            useResizeHandler
          />
        );

      case 'pendulum':
        return (
          <div className="grid-2">
            <Plot
              data={[{
                x: result.t, y: result.theta, type: 'scatter', mode: 'lines',
                line: { color: '#a855f7', width: 2 }, name: 'Angle',
              }]}
              layout={{ ...PLOT_LAYOUT, xaxis: { ...PLOT_LAYOUT.xaxis, title: 't (s)' },
                yaxis: { ...PLOT_LAYOUT.yaxis, title: 'theta (deg)' }, autosize: true }}
              config={{ responsive: true }}
              style={{ width: '100%', height: 350 }}
              useResizeHandler
            />
            <Plot
              data={[{
                x: result.x, y: result.y, type: 'scatter', mode: 'lines',
                line: { color: '#ec4899', width: 2 }, name: 'Trajectory',
              }]}
              layout={{ ...PLOT_LAYOUT, xaxis: { ...PLOT_LAYOUT.xaxis, title: 'x (m)' },
                yaxis: { ...PLOT_LAYOUT.yaxis, title: 'y (m)', scaleanchor: 'x' }, autosize: true }}
              config={{ responsive: true }}
              style={{ width: '100%', height: 350 }}
              useResizeHandler
            />
          </div>
        );

      case 'wave':
        return (
          <Plot
            data={[
              { x: result.x, y: result.frames[0], type: 'scatter', mode: 'lines',
                line: { color: '#06b6d4', width: 2 }, name: 't=0' },
              { x: result.x, y: result.frames[Math.floor(result.frames.length / 4)],
                type: 'scatter', mode: 'lines',
                line: { color: '#6366f1', width: 2 }, name: 't=T/4' },
              { x: result.x, y: result.frames[Math.floor(result.frames.length / 2)],
                type: 'scatter', mode: 'lines',
                line: { color: '#a855f7', width: 2 }, name: 't=T/2' },
            ]}
            layout={{ ...PLOT_LAYOUT, showlegend: true, autosize: true }}
            config={{ responsive: true }}
            style={{ width: '100%', height: 450 }}
            useResizeHandler
          />
        );

      case 'orbital':
        return (
          <Plot
            data={[
              { x: result.x, y: result.y, type: 'scatter', mode: 'lines',
                line: { color: '#06b6d4', width: 2 }, name: 'Orbit' },
              { x: [0], y: [0], type: 'scatter', mode: 'markers',
                marker: { color: '#f97316', size: 14 }, name: 'Sun' },
            ]}
            layout={{ ...PLOT_LAYOUT, showlegend: true,
              xaxis: { ...PLOT_LAYOUT.xaxis, title: 'x (AU)', scaleanchor: 'y' },
              yaxis: { ...PLOT_LAYOUT.yaxis, title: 'y (AU)' }, autosize: true }}
            config={{ responsive: true }}
            style={{ width: '100%', height: 450 }}
            useResizeHandler
          />
        );

      case 'efield':
        return (
          <Plot
            data={[
              ...(result.charges || []).map((ch, i) => ({
                x: [ch.x], y: [ch.y], type: 'scatter', mode: 'markers',
                marker: { color: ch.q > 0 ? '#ef4444' : '#3b82f6', size: 16 },
                name: `q${i + 1}=${ch.q > 0 ? '+' : ''}${ch.q}`,
              })),
            ]}
            layout={{ ...PLOT_LAYOUT, showlegend: true, autosize: true,
              xaxis: { ...PLOT_LAYOUT.xaxis, title: 'x', range: [-5, 5] },
              yaxis: { ...PLOT_LAYOUT.yaxis, title: 'y', range: [-5, 5], scaleanchor: 'x' }
            }}
            config={{ responsive: true }}
            style={{ width: '100%', height: 450 }}
            useResizeHandler
          />
        );

      default: return null;
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('physics.title')}</h2>
          <div className="subtitle">{t('physics.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        <div className="split-panel">
          <div>
            <div className="card">
              <div className="card-header">{t('physics.simulation')}</div>
              <div className="card-body">
                <div className="btn-group">
                  {SIMS.map(s => (
                    <button
                      key={s.id}
                      className={`btn ${sim === s.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => { setSim(s.id); setResult(null); setParams({}); }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">{t('physics.parameters')}</div>
              <div className="card-body">
                {renderParams()}
                <button
                  className="btn btn-primary"
                  onClick={runSimulation}
                  disabled={loading}
                  style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                >
                  {loading ? <span className="spinner" /> : t('physics.runSimulation')}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">{t('physics.results')}</div>
            <div className="card-body">
              {loading && (
                <div className="loading-overlay">
                  <span className="spinner" /> {t('physics.simulating')}
                </div>
              )}
              {result && !loading && renderPlot()}
              {!result && !loading && (
                <div className="empty-state" style={{ height: 400 }}>
                  <div className="empty-icon">⚛</div>
                  <h3>{t('physics.readyTitle')}</h3>
                  <p>{t('physics.readyDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
