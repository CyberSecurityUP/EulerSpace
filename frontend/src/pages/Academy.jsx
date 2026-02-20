import { useState, useMemo } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';
import {
  ALL_PATHS, MATH_CURRICULUM, PHYSICS_CURRICULUM,
  LEVEL_COLORS, LEVEL_LABELS,
} from '../data/curriculum';
import { getTranslatedCurriculum } from '../data/curriculumI18n';

/** Smart answer checking - normalizes and compares */
function checkAnswer(userAnswer, correctAnswer) {
  if (!userAnswer?.trim()) return false;
  const normalize = s => s.toLowerCase().replace(/\s+/g, ' ').replace(/[,;]/g, '').trim();
  const ua = normalize(userAnswer);
  const ca = normalize(correctAnswer);
  if (ua === ca) return true;

  // Numeric comparison
  const uaNum = parseFloat(ua.replace(/[^0-9.\-\/]/g, ''));
  const caNum = parseFloat(ca.replace(/[^0-9.\-\/]/g, ''));
  if (!isNaN(uaNum) && !isNaN(caNum) && Math.abs(uaNum - caNum) < 0.1) return true;

  // Strip units and compare
  const stripUnits = s => s.replace(/\s*(m\/s|m|s|n|j|w|v|a|ohm|kg|hz|c|ev)$/i, '').trim();
  if (stripUnits(ua) === stripUnits(ca)) return true;

  // Check if user answer contains the key number
  const nums = ca.match(/-?[\d.]+/g);
  if (nums && nums.some(n => ua.includes(n))) return true;

  // Check alternatives with "or"
  if (ca.includes(' or ')) {
    const alts = ca.split(' or ').map(normalize);
    if (alts.some(a => ua === a || ua.includes(a))) return true;
  }

  return false;
}

function PathCard({ path, onClick, t }) {
  const totalLessons = path.lessons.length;
  const totalDuration = path.lessons.reduce((sum, l) => {
    const m = parseInt(l.duration);
    return sum + (isNaN(m) ? 0 : m);
  }, 0);

  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 24,
            background: `${LEVEL_COLORS[path.level]}15`,
          }}>
            {path.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{path.title}</div>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
              color: LEVEL_COLORS[path.level],
            }}>
              {LEVEL_LABELS[path.level]}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          {path.description}
        </p>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{totalLessons} {t('academy.lessons')}</span>
          <span>{totalDuration} min</span>
        </div>
        {/* Progress bar placeholder */}
        <div style={{
          marginTop: 10, height: 3, borderRadius: 2,
          background: 'var(--bg-tertiary)',
        }}>
          <div style={{ width: '0%', height: '100%', borderRadius: 2, background: LEVEL_COLORS[path.level] }} />
        </div>
      </div>
    </div>
  );
}

function LessonView({ lesson, onBack, onNext, hasNext, t }) {
  const [tab, setTab] = useState('theory');
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [revealed, setRevealed] = useState({});
  const [showHints, setShowHints] = useState({});
  const [practiceScore, setPracticeScore] = useState(null);

  const handleCheck = (i, answer) => {
    const isCorrect = checkAnswer(answers[i], answer);
    setChecked({ ...checked, [i]: isCorrect ? 'correct' : 'incorrect' });
    setRevealed({ ...revealed, [i]: true });
  };

  const checkAll = () => {
    let correct = 0;
    const newChecked = {};
    const newRevealed = {};
    lesson.practice.forEach((p, i) => {
      const isCorrect = checkAnswer(answers[i], p.answer);
      newChecked[i] = isCorrect ? 'correct' : 'incorrect';
      newRevealed[i] = true;
      if (isCorrect) correct++;
    });
    setChecked(newChecked);
    setRevealed(newRevealed);
    setPracticeScore(correct);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>← {t('common.back')}</button>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>{lesson.title}</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lesson.duration}</span>
        </div>
        {hasNext && (
          <button className="btn btn-primary btn-sm" onClick={onNext}>{t('academy.nextLesson')} →</button>
        )}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'theory' ? 'active' : ''}`} onClick={() => setTab('theory')}>
          {t('academy.theory')}
        </button>
        <button className={`tab ${tab === 'practice' ? 'active' : ''}`} onClick={() => setTab('practice')}>
          {t('academy.practice')} ({lesson.practice.length})
        </button>
      </div>

      {tab === 'theory' && (
        <div className="card">
          <div className="card-body" style={{ maxWidth: 800 }}>
            {lesson.theory.map((block, i) => {
              if (block.type === 'heading') {
                return (
                  <h4 key={i} style={{
                    fontSize: 16, fontWeight: 600, color: 'var(--accent-hover)',
                    marginTop: i > 0 ? 28 : 0, marginBottom: 12,
                    paddingTop: i > 0 ? 20 : 0,
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--accent)', flexShrink: 0,
                    }} />
                    {block.content}
                  </h4>
                );
              }
              if (block.type === 'latex') {
                return (
                  <div key={i} style={{
                    padding: '14px 20px', margin: '10px 0',
                    background: 'var(--bg-primary)', borderRadius: 10,
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}>
                    <LatexRenderer math={block.content} display />
                  </div>
                );
              }
              if (block.type === 'example') {
                return (
                  <div key={i} style={{
                    padding: '12px 16px', margin: '8px 0', borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.06)',
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase' }}>
                      {t('academy.examples')}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {block.content}
                    </div>
                  </div>
                );
              }
              if (block.type === 'note') {
                return (
                  <div key={i} style={{
                    padding: '10px 14px', margin: '8px 0', borderRadius: 8,
                    background: 'rgba(245, 158, 11, 0.06)',
                    borderLeft: '3px solid #f59e0b',
                  }}>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                      {block.content}
                    </div>
                  </div>
                );
              }
              return (
                <p key={i} style={{
                  fontSize: 14, color: 'var(--text-secondary)',
                  lineHeight: 1.8, marginBottom: 10,
                }}>
                  {block.content}
                </p>
              );
            })}

            {/* Summary section if lesson has it */}
            {lesson.summary && (
              <div style={{
                marginTop: 24, padding: '16px 20px', borderRadius: 10,
                background: 'rgba(34, 197, 94, 0.06)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', marginBottom: 8, textTransform: 'uppercase' }}>
                  {t('academy.summary')}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {lesson.summary}
                </div>
              </div>
            )}

            {/* Next lesson CTA */}
            {hasNext && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={() => { setTab('practice'); }}>
                  {t('academy.practice')} →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'practice' && (
        <div>
          {lesson.practice.map((p, i) => (
            <div key={i} className="exercise-card" style={{
              borderLeft: checked[i] === 'correct' ? '3px solid var(--success)' :
                checked[i] === 'incorrect' ? '3px solid #ef4444' : '3px solid transparent',
            }}>
              <div className="exercise-number">{t('foundations.question')} {i + 1}</div>
              <div style={{ fontSize: 15, marginBottom: 12, lineHeight: 1.6 }}>
                {p.question.includes('\\') ? (
                  <LatexRenderer math={p.question} display />
                ) : (
                  <span>{p.question}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  className="input"
                  value={answers[i] || ''}
                  onChange={e => {
                    setAnswers({ ...answers, [i]: e.target.value });
                    if (checked[i]) setChecked({ ...checked, [i]: undefined });
                  }}
                  placeholder={t('foundations.typeAnswer')}
                  style={{ flex: 1, maxWidth: 400 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCheck(i, p.answer);
                  }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCheck(i, p.answer)}
                >
                  {t('foundations.checkBtn')}
                </button>
                {p.hint && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowHints({ ...showHints, [i]: !showHints[i] })}
                    style={{ fontSize: 11 }}
                  >
                    {showHints[i] ? t('foundations.hideHint') : t('foundations.showHint')}
                  </button>
                )}
              </div>

              {/* Hint */}
              {showHints[i] && p.hint && (
                <div style={{
                  marginTop: 8, padding: '8px 12px', borderRadius: 6,
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  fontSize: 13, color: 'var(--accent-hover)', fontStyle: 'italic',
                }}>
                  💡 {p.hint}
                </div>
              )}

              {/* Result feedback */}
              {checked[i] === 'correct' && (
                <div style={{
                  marginTop: 10, padding: '8px 14px', borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  fontSize: 13, color: 'var(--success)', fontWeight: 500,
                }}>
                  ✓ {t('foundations.correctResult')}
                </div>
              )}

              {checked[i] === 'incorrect' && revealed[i] && (
                <div style={{ marginTop: 10 }}>
                  <div style={{
                    padding: '8px 14px', borderRadius: 8, marginBottom: 6,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: 13, color: '#ef4444',
                  }}>
                    ✗ {t('foundations.incorrectResult')}
                    {answers[i] && (
                      <span style={{ opacity: 0.7, marginLeft: 8 }}>
                        ({t('foundations.youAnswered')}: {answers[i]})
                      </span>
                    )}
                  </div>
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 4, textTransform: 'uppercase' }}>
                      {t('foundations.answer')}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                      {p.answer.includes('\\') ? <LatexRenderer math={p.answer} /> : p.answer}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setChecked({ ...checked, [i]: 'correct' })}
                    style={{ marginTop: 6, fontSize: 11 }}
                  >
                    {t('foundations.iWasRight')}
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={checkAll}>
              {t('academy.revealAll')}
            </button>
            {practiceScore !== null && (
              <div className="badge badge-success" style={{ fontSize: 13, padding: '8px 14px' }}>
                {t('foundations.score')}: {practiceScore}/{lesson.practice.length}
              </div>
            )}
            {hasNext && (
              <button className="btn btn-secondary" onClick={onNext} style={{ marginLeft: 'auto' }}>
                {t('academy.nextLesson')} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Academy() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState('all');
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Translate curriculum based on current language
  const translatedAll = useMemo(() => getTranslatedCurriculum(ALL_PATHS, lang), [lang]);
  const translatedMath = useMemo(() => getTranslatedCurriculum(MATH_CURRICULUM, lang), [lang]);
  const translatedPhysics = useMemo(() => getTranslatedCurriculum(PHYSICS_CURRICULUM, lang), [lang]);

  const filteredPaths = filter === 'all' ? translatedAll :
    filter === 'math' ? translatedMath : translatedPhysics;

  if (selectedPath !== null && selectedLesson !== null) {
    const path = translatedAll.find(p => p.id === selectedPath);
    const lesson = path?.lessons[selectedLesson];
    if (!path || !lesson) return null;

    const hasNext = selectedLesson < path.lessons.length - 1;

    return (
      <>
        <div className="page-header">
          <div>
            <h2>{path.icon} {path.title}</h2>
            <div className="subtitle">{t('academy.lesson')} {selectedLesson + 1} / {path.lessons.length}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {path.lessons.map((_, i) => (
              <div
                key={i}
                onClick={() => setSelectedLesson(i)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  fontWeight: 600, cursor: 'pointer',
                  background: i === selectedLesson ? 'var(--accent)' :
                    i < selectedLesson ? 'var(--success)' : 'var(--bg-tertiary)',
                  color: i <= selectedLesson ? 'white' : 'var(--text-muted)',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="page-body">
          <LessonView
            lesson={lesson}
            t={t}
            onBack={() => { setSelectedLesson(null); }}
            onNext={() => setSelectedLesson(prev => Math.min(prev + 1, path.lessons.length - 1))}
            hasNext={hasNext}
          />
        </div>
      </>
    );
  }

  if (selectedPath !== null) {
    const path = translatedAll.find(p => p.id === selectedPath);
    if (!path) return null;

    return (
      <>
        <div className="page-header">
          <div>
            <h2>{path.icon} {path.title}</h2>
            <div className="subtitle">{path.description}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPath(null)}>
            ← {t('academy.allCoursesBack')}
          </button>
        </div>
        <div className="page-body">
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {path.lessons.map((lesson, i) => (
              <div
                key={lesson.id}
                className="card"
                style={{ marginBottom: 12, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onClick={() => setSelectedLesson(i)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'var(--accent-glow)', color: 'var(--accent-hover)',
                    fontWeight: 700, fontSize: 15, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{lesson.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {lesson.duration} &middot; {lesson.practice.length} {t('foundations.exercises')}
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>→</span>
                </div>
              </div>
            ))}

            <button
              className="btn btn-primary"
              onClick={() => setSelectedLesson(0)}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {t('academy.startLearning')}
            </button>
          </div>
        </div>
      </>
    );
  }

  const LEVEL_LABELS_I18N = {
    basic: t('academy.beginner'),
    intermediate: t('academy.intermediate'),
    advanced: t('academy.advanced'),
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('academy.title')}</h2>
          <div className="subtitle">{t('academy.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { id: 'all', label: t('academy.allCourses') },
            { id: 'math', label: t('academy.mathematics') },
            { id: 'physics', label: t('academy.physics') },
          ].map(f => (
            <button
              key={f.id}
              className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {['basic', 'intermediate', 'advanced'].map(level => {
          const paths = filteredPaths.filter(p => p.level === level);
          if (paths.length === 0) return null;
          return (
            <div key={level} style={{ marginBottom: 32 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: LEVEL_COLORS[level],
                }} />
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{LEVEL_LABELS_I18N[level]}</h3>
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4,
                }}>
                  {paths.reduce((sum, p) => sum + p.lessons.length, 0)} {t('academy.lessons')}
                </div>
              </div>
              <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {paths.map(path => (
                  <PathCard key={path.id} path={path} t={t} onClick={() => setSelectedPath(path.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
