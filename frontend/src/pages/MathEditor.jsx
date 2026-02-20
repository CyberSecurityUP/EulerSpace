import { useState, useCallback } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';

const TEMPLATES = [
  { label: 'Quadratic', text: 'ax^2 + bx + c = 0' },
  { label: 'Integral', text: '\\int_0^1 x^2 dx' },
  { label: 'Derivative', text: '\\frac{d}{dx}[x^3 + 2x]' },
  { label: 'Matrix', text: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Sum', text: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2}' },
  { label: 'Limit', text: '\\lim_{x \\to 0} \\frac{\\sin x}{x}' },
];

export default function MathEditor() {
  const { t } = useI18n();
  const [latex, setLatex] = useState('E = mc^2');
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback(() => {
    if (latex.trim()) {
      setHistory(prev => [latex, ...prev.slice(0, 19)]);
    }
  }, [latex]);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('editor.title')}</h2>
          <div className="subtitle">{t('editor.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        <div className="split-panel">
          <div>
            <div className="card">
              <div className="card-header">{t('editor.latexInput')}</div>
              <div className="card-body">
                <textarea
                  className="input"
                  value={latex}
                  onChange={e => setLatex(e.target.value)}
                  onBlur={addToHistory}
                  placeholder={t('editor.placeholder')}
                  rows={6}
                  spellCheck={false}
                />
                <div style={{ marginTop: 12 }}>
                  <div className="result-label">{t('editor.quickTemplates')}</div>
                  <div className="btn-group" style={{ marginTop: 6 }}>
                    {TEMPLATES.map(tmpl => (
                      <button
                        key={tmpl.label}
                        className="btn btn-secondary btn-sm"
                        onClick={() => setLatex(tmpl.text)}
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-header">{t('editor.history')}</div>
                <div className="card-body">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: 6,
                        marginBottom: 4,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      onClick={() => setLatex(item)}
                      className="nav-item"
                    >
                      {item.length > 50 ? item.slice(0, 50) + '...' : item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">{t('editor.preview')}</div>
            <div
              className="card-body"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                fontSize: 24,
              }}
            >
              {latex.trim() ? (
                <LatexRenderer math={latex} display />
              ) : (
                <div className="empty-state">
                  <p>{t('editor.startTyping')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
