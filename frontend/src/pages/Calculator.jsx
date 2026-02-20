import { useState } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';
import {
  solveMath, differentiateMath, integrateMath,
  simplifyMath, limitMath, matrixMath,
} from '../services/api';

export default function Calculator() {
  const { t } = useI18n();
  const [operation, setOperation] = useState('solve');
  const [expression, setExpression] = useState('');
  const [variable, setVariable] = useState('x');
  const [extra, setExtra] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const OPERATIONS = [
    { id: 'solve', label: t('calc.solve'), icon: '=' },
    { id: 'differentiate', label: t('calc.derivative'), icon: 'd/dx' },
    { id: 'integrate', label: t('calc.integral'), icon: '∫' },
    { id: 'simplify', label: t('calc.simplify'), icon: '~' },
    { id: 'limit', label: t('calc.limit'), icon: 'lim' },
    { id: 'matrix', label: t('calc.matrix'), icon: '[ ]' },
  ];

  const compute = async () => {
    if (!expression.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      switch (operation) {
        case 'solve':
          res = await solveMath(expression, variable);
          break;
        case 'differentiate':
          res = await differentiateMath(expression, variable, extra.order || 1);
          break;
        case 'integrate':
          res = await integrateMath(expression, variable, extra.lower || null, extra.upper || null);
          break;
        case 'simplify':
          res = await simplifyMath(expression);
          break;
        case 'limit':
          res = await limitMath(expression, variable, extra.point || '0');
          break;
        case 'matrix':
          try {
            const matrix = JSON.parse(expression);
            res = await matrixMath(matrix, extra.matrixOp || 'determinant');
          } catch {
            setError('Matrix must be valid JSON, e.g. [[1,2],[3,4]]');
            setLoading(false);
            return;
          }
          break;
        default:
          break;
      }
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('calc.title')}</h2>
          <div className="subtitle">{t('calc.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        <div className="split-panel">
          <div>
            <div className="card">
              <div className="card-header">{t('calc.operation')}</div>
              <div className="card-body">
                <div className="btn-group">
                  {OPERATIONS.map(op => (
                    <button
                      key={op.id}
                      className={`btn ${operation === op.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => { setOperation(op.id); setResult(null); }}
                    >
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                        {op.icon}
                      </span>
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">{t('calc.input')}</div>
              <div className="card-body">
                <div className="input-group">
                  <label>
                    {operation === 'matrix' ? t('calc.matrixJSON') : t('calc.expression')}
                  </label>
                  <input
                    className="input"
                    value={expression}
                    onChange={e => setExpression(e.target.value)}
                    placeholder={
                      operation === 'solve' ? 'x^2 - 4 = 0' :
                      operation === 'differentiate' ? 'x^3 + 2*x' :
                      operation === 'integrate' ? 'sin(x)*cos(x)' :
                      operation === 'simplify' ? '(x+1)^2 - x^2' :
                      operation === 'limit' ? 'sin(x)/x' :
                      '[[1,2],[3,4]]'
                    }
                    onKeyDown={e => e.key === 'Enter' && compute()}
                  />
                </div>

                {operation !== 'matrix' && operation !== 'simplify' && (
                  <div className="params-row">
                    <div className="input-group">
                      <label>{t('calc.variable')}</label>
                      <input
                        className="input"
                        value={variable}
                        onChange={e => setVariable(e.target.value)}
                        style={{ width: 60 }}
                      />
                    </div>

                    {operation === 'differentiate' && (
                      <div className="input-group">
                        <label>{t('calc.order')}</label>
                        <input
                          className="input"
                          type="number"
                          min={1}
                          max={10}
                          value={extra.order || 1}
                          onChange={e => setExtra({ ...extra, order: parseInt(e.target.value) })}
                          style={{ width: 60 }}
                        />
                      </div>
                    )}

                    {operation === 'integrate' && (
                      <>
                        <div className="input-group">
                          <label>{t('calc.lowerBound')}</label>
                          <input
                            className="input"
                            value={extra.lower || ''}
                            onChange={e => setExtra({ ...extra, lower: e.target.value })}
                            placeholder="(optional)"
                          />
                        </div>
                        <div className="input-group">
                          <label>{t('calc.upperBound')}</label>
                          <input
                            className="input"
                            value={extra.upper || ''}
                            onChange={e => setExtra({ ...extra, upper: e.target.value })}
                            placeholder="(optional)"
                          />
                        </div>
                      </>
                    )}

                    {operation === 'limit' && (
                      <div className="input-group">
                        <label>{t('calc.point')}</label>
                        <input
                          className="input"
                          value={extra.point || '0'}
                          onChange={e => setExtra({ ...extra, point: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                )}

                {operation === 'matrix' && (
                  <div className="input-group">
                    <label>{t('calc.matrixOp')}</label>
                    <select
                      className="input"
                      value={extra.matrixOp || 'determinant'}
                      onChange={e => setExtra({ ...extra, matrixOp: e.target.value })}
                    >
                      <option value="determinant">{t('calc.determinant')}</option>
                      <option value="inverse">{t('calc.inverse')}</option>
                      <option value="eigenvalues">{t('calc.eigenvalues')}</option>
                      <option value="rref">{t('calc.rowEchelon')}</option>
                      <option value="transpose">{t('calc.transpose')}</option>
                    </select>
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  onClick={compute}
                  disabled={loading || !expression.trim()}
                  style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                >
                  {loading ? <span className="spinner" /> : t('calc.compute')}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">{t('calc.result')}</div>
            <div className="card-body">
              {loading && (
                <div className="loading-overlay">
                  <span className="spinner" /> {t('common.computing')}
                </div>
              )}

              {error && (
                <div className="result-box" style={{ borderColor: 'var(--danger)' }}>
                  <div className="result-label" style={{ color: 'var(--danger)' }}>{t('calc.error')}</div>
                  <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>
                </div>
              )}

              {result && !loading && (
                <div>
                  {result.latex && (
                    <div className="result-box">
                      <div className="result-label">{t('calc.result')}</div>
                      <div className="result-value">
                        {typeof result.latex === 'string' ? (
                          <LatexRenderer math={result.latex} display />
                        ) : (
                          result.latex.map((l, i) => (
                            <div key={i}><LatexRenderer math={l} display /></div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {result.solutions && (
                    <div className="result-box" style={{ marginTop: 12 }}>
                      <div className="result-label">{t('calc.solutions')}</div>
                      {result.solutions.map((s, i) => (
                        <div key={i} className="result-value" style={{ marginBottom: 4 }}>
                          {variable} = {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.simplified && !result.solutions && (
                    <div className="result-box" style={{ marginTop: 12 }}>
                      <div className="result-label">{t('calc.simplified')}</div>
                      <div className="result-value">
                        <LatexRenderer math={result.simplified} display />
                      </div>
                    </div>
                  )}

                  {result.expanded && (
                    <div className="result-box" style={{ marginTop: 12 }}>
                      <div className="result-label">{t('calc.expanded')}</div>
                      <div className="result-value">
                        <LatexRenderer math={result.expanded} display />
                      </div>
                    </div>
                  )}

                  {result.factored && (
                    <div className="result-box" style={{ marginTop: 12 }}>
                      <div className="result-label">{t('calc.factored')}</div>
                      <div className="result-value">
                        <LatexRenderer math={result.factored} display />
                      </div>
                    </div>
                  )}

                  {result.steps && (
                    <div className="result-box" style={{ marginTop: 12 }}>
                      <div className="result-label">{t('calc.steps')}</div>
                      <ul className="step-list">
                        {result.steps.map((step, i) => (
                          <li key={i} className="step-item">
                            {typeof step === 'string' ? (
                              <div className="step-math">{step}</div>
                            ) : (
                              <>
                                <div className="step-desc">{step.description}</div>
                                <div className="step-math">
                                  <LatexRenderer math={step.latex} />
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!result && !loading && !error && (
                <div className="empty-state">
                  <div className="empty-icon">🧮</div>
                  <h3>{t('calc.readyTitle')}</h3>
                  <p>{t('calc.readyDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
