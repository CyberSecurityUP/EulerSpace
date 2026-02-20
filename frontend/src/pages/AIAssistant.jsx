import { useState } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';
import { explainMath, getExercises, validateProof } from '../services/api';

export default function AIAssistant() {
  const { t } = useI18n();
  const [mode, setMode] = useState('explain');
  const [expression, setExpression] = useState('');
  const [operation, setOperation] = useState('differentiate');
  const [topic, setTopic] = useState('derivatives');
  const [difficulty, setDifficulty] = useState('medium');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState({});

  const MODES = [
    { id: 'explain', label: t('ai.stepByStep'), icon: '📝' },
    { id: 'exercises', label: t('ai.exercisesMode'), icon: '📚' },
    { id: 'validate', label: t('ai.validate'), icon: '✓' },
  ];

  const run = async () => {
    setLoading(true);
    setResult(null);
    setShowAnswers({});
    try {
      let res;
      switch (mode) {
        case 'explain':
          res = await explainMath(expression, operation);
          break;
        case 'exercises':
          res = await getExercises(topic, difficulty, 5);
          break;
        case 'validate':
          res = await validateProof(expression);
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

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('ai.title')}</h2>
          <div className="subtitle">{t('ai.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        <div className="split-panel">
          <div>
            <div className="card">
              <div className="card-header">{t('ai.mode')}</div>
              <div className="card-body">
                <div className="btn-group">
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      className={`btn ${mode === m.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => { setMode(m.id); setResult(null); }}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">
                {mode === 'explain' ? t('ai.expressionToExplain') :
                 mode === 'exercises' ? t('ai.generateExercises') : t('ai.validateClaim')}
              </div>
              <div className="card-body">
                {mode === 'explain' && (
                  <>
                    <div className="input-group">
                      <label>{t('ai.expression')}</label>
                      <input
                        className="input"
                        value={expression}
                        onChange={e => setExpression(e.target.value)}
                        placeholder="e.g. x^3 + 2*x*sin(x)"
                        onKeyDown={e => e.key === 'Enter' && run()}
                      />
                    </div>
                    <div className="input-group">
                      <label>{t('ai.operationLabel')}</label>
                      <select
                        className="input"
                        value={operation}
                        onChange={e => setOperation(e.target.value)}
                      >
                        <option value="differentiate">{t('ai.differentiate')}</option>
                        <option value="integrate">{t('ai.integrate')}</option>
                        <option value="solve">{t('ai.solveOp')}</option>
                        <option value="simplify">{t('ai.simplifyOp')}</option>
                      </select>
                    </div>
                  </>
                )}

                {mode === 'exercises' && (
                  <>
                    <div className="input-group">
                      <label>{t('ai.topic')}</label>
                      <select
                        className="input"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                      >
                        <option value="derivatives">{t('ai.derivatives')}</option>
                        <option value="integrals">{t('ai.integrals')}</option>
                        <option value="equations">{t('ai.equations')}</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t('ai.difficulty')}</label>
                      <div className="difficulty-selector">
                        {[
                          { key: 'easy', label: t('ai.easy') },
                          { key: 'medium', label: t('ai.medium') },
                          { key: 'hard', label: t('ai.hard') },
                        ].map(d => (
                          <button
                            key={d.key}
                            className={`difficulty-btn ${difficulty === d.key ? 'active' : ''}`}
                            onClick={() => setDifficulty(d.key)}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {mode === 'validate' && (
                  <div className="input-group">
                    <label>{t('ai.claim')}</label>
                    <input
                      className="input"
                      value={expression}
                      onChange={e => setExpression(e.target.value)}
                      placeholder="e.g. (x+1)^2 - (x^2 + 2*x + 1)"
                      onKeyDown={e => e.key === 'Enter' && run()}
                    />
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  onClick={run}
                  disabled={loading}
                  style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                >
                  {loading ? <span className="spinner" /> :
                    mode === 'explain' ? t('ai.explain') :
                    mode === 'exercises' ? t('ai.generate') : t('ai.validate')}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">{t('ai.output')}</div>
            <div className="card-body">
              {loading && (
                <div className="loading-overlay">
                  <span className="spinner" /> {t('ai.processing')}
                </div>
              )}

              {result && !loading && mode === 'explain' && result.steps && (
                <ul className="step-list">
                  {result.steps.map((step, i) => (
                    <li key={i} className="step-item" style={{ borderLeftColor: 'var(--accent)' }}>
                      <div className="step-desc">{step.description}</div>
                      <div className="step-math">
                        <LatexRenderer math={step.latex} display />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {result && !loading && mode === 'exercises' && Array.isArray(result) && (
                <div>
                  {result.map((ex, i) => (
                    <div key={i} className="exercise-card">
                      <div className="exercise-number">{t('ai.problem')} {i + 1}</div>
                      <LatexRenderer math={ex.problem_latex} display />
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: 8 }}
                        onClick={() => setShowAnswers(prev => ({ ...prev, [i]: !prev[i] }))}
                      >
                        {showAnswers[i] ? t('ai.hideAnswer') : t('ai.showAnswer')}
                      </button>
                      {showAnswers[i] && (
                        <div className="exercise-answer">
                          <LatexRenderer math={ex.answer} display />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {result && !loading && mode === 'validate' && (
                <div className="result-box">
                  <div className="result-label">{t('ai.validation')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span className={`badge ${result.valid ? 'badge-success' : 'badge-warning'}`}>
                      {result.valid ? t('ai.valid') : t('ai.unverified')}
                    </span>
                  </div>
                  {result.simplified && (
                    <div>
                      <div className="result-label" style={{ marginTop: 10 }}>{t('ai.simplifiedForm')}</div>
                      <div className="result-value">
                        <LatexRenderer math={result.simplified} display />
                      </div>
                    </div>
                  )}
                  {result.note && (
                    <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                      {result.note}
                    </div>
                  )}
                </div>
              )}

              {!result && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">🤖</div>
                  <h3>{t('ai.readyTitle')}</h3>
                  <p>{t('ai.readyDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
