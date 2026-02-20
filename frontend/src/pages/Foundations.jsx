import { useState } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { MATH_FOUNDATIONS } from '../data/mathFoundations';
import { PHYSICS_FOUNDATIONS } from '../data/physicsFoundations';
import { useI18n } from '../i18n/context';
import { mathExerciseTranslations, physicsExerciseTranslations, getTranslatedExercises } from '../data/foundationsI18n';

/* ── Answer Checking ─────────────────────────────────────────── */
function checkUserAnswer(userInput, correctAnswer) {
  if (!userInput.trim()) return false;
  const norm = s => s.toString().trim().toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ');
  const u = norm(userInput);
  const c = norm(correctAnswer);
  if (u === c) return true;

  const alts = c.split(/\s+(?:ou|or)\s+/);
  for (const alt of alts) {
    const a = alt.trim();
    if (u === a) return true;
    const us = u.replace(/[^0-9.\-\/]/g, '');
    const as_ = a.replace(/[^0-9.\-\/]/g, '');
    if (us && as_ && us === as_) return true;
    const un = parseFloat(us);
    const an = parseFloat(as_);
    if (!isNaN(un) && !isNaN(an) && Math.abs(un - an) < 0.01) return true;
  }

  const um = u.match(/-?\d+\.?\d*/);
  const cm = c.match(/-?\d+\.?\d*/);
  if (um && cm) {
    if (Math.abs(parseFloat(um[0]) - parseFloat(cm[0])) < 0.01) return true;
  }
  return false;
}

/* ── Progress Bar ────────────────────────────────────────────── */
function ProgressBar({ current, total, color }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 20,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
}

/* ── Multiplication Table ────────────────────────────────────── */
function MultiplicationTable() {
  const nums = [1,2,3,4,5,6,7,8,9,10,11,12];
  const cell = { padding: '7px 4px', textAlign: 'center', border: '1px solid var(--border)', fontSize: 12 };
  const hdrCell = { ...cell, background: 'var(--accent)', color: 'white', fontWeight: 700 };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: "'JetBrains Mono', monospace" }}>
        <thead>
          <tr>
            <th style={hdrCell}>×</th>
            {nums.map(n => <th key={n} style={hdrCell}>{n}</th>)}
          </tr>
        </thead>
        <tbody>
          {nums.map(row => (
            <tr key={row}>
              <td style={hdrCell}>{row}</td>
              {nums.map(col => (
                <td key={col} style={{ ...cell, background: (row + col) % 2 === 0 ? 'var(--bg-primary)' : 'transparent' }}>
                  {row * col}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Simple Calculator ───────────────────────────────────────── */
function SimpleCalculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const pressNum = (n) => {
    if (fresh) { setDisplay(n === '.' ? '0.' : n); setFresh(false); }
    else if (n === '.' && display.includes('.')) return;
    else setDisplay(display === '0' && n !== '.' ? n : display + n);
  };

  const calc = (a, b, o) => {
    switch (o) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? Math.round((a / b) * 10000) / 10000 : 'Error';
      default: return b;
    }
  };

  const pressOp = (o) => {
    if (prev !== null && op && !fresh) {
      const r = calc(prev, parseFloat(display), op);
      setDisplay(String(r));
      setPrev(r);
    } else {
      setPrev(parseFloat(display));
    }
    setOp(o);
    setFresh(true);
  };

  const pressEquals = () => {
    if (prev === null || !op) return;
    const r = calc(prev, parseFloat(display), op);
    setDisplay(String(r));
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const pressClear = () => {
    setDisplay('0'); setPrev(null); setOp(null); setFresh(true);
  };

  const btnStyle = (type) => ({
    padding: '14px 0', border: '1px solid var(--border)', borderRadius: 8,
    cursor: 'pointer', fontSize: 16, fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    background: type === 'op' ? 'var(--accent-glow)' : type === 'eq' ? 'var(--accent)' : type === 'clear' ? 'rgba(239,68,68,0.1)' : 'var(--bg-primary)',
    color: type === 'eq' ? 'white' : type === 'op' ? 'var(--accent-hover)' : type === 'clear' ? 'var(--danger)' : 'var(--text-primary)',
  });

  return (
    <div style={{ maxWidth: 280, margin: '0 auto' }}>
      <div style={{
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '14px 16px', marginBottom: 10,
        fontSize: 26, fontWeight: 700, textAlign: 'right', overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)',
        minHeight: 44,
      }}>
        {display}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {[
          ['7','8','9','÷'],
          ['4','5','6','×'],
          ['1','2','3','-'],
          ['0','.','C','+'],
        ].flat().map(key => {
          const isOp = ['+','-','×','÷'].includes(key);
          const isClear = key === 'C';
          return (
            <button key={key} style={btnStyle(isOp ? 'op' : isClear ? 'clear' : 'num')}
              onClick={() => {
                if (isClear) pressClear();
                else if (isOp) pressOp(key);
                else pressNum(key);
              }}>
              {key}
            </button>
          );
        })}
        <button style={{ ...btnStyle('eq'), gridColumn: 'span 4' }} onClick={pressEquals}>=</button>
      </div>
    </div>
  );
}

/* ── Resources Panel (Modal) ─────────────────────────────────── */
function ResourcesPanel({ show, onClose, t }) {
  const [tab, setTab] = useState('table');
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
        width: '90%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('foundations.resources')}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px 8px',
          }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px' }}>
          <button
            className={`btn ${tab === 'table' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setTab('table')}
          >
            {t('foundations.multTable')}
          </button>
          <button
            className={`btn ${tab === 'calc' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setTab('calc')}
          >
            {t('foundations.calculator')}
          </button>
        </div>
        <div style={{ padding: '12px 20px 20px' }}>
          {tab === 'table' ? <MultiplicationTable /> : <SimpleCalculator />}
        </div>
      </div>
    </div>
  );
}

/* ── Exercise Card ───────────────────────────────────────────── */
function ExerciseCard({ exercise, index, answer, onAnswer, checked, correct, onCheck, onOverride, hintVisible, onToggleHint, t }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 20, marginBottom: 14,
      borderLeft: checked
        ? (correct ? '4px solid var(--success)' : '4px solid var(--danger)')
        : '4px solid var(--border)',
      transition: 'all 0.3s',
    }}>
      {/* Question */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 14,
          fontWeight: 700, flexShrink: 0,
          background: checked
            ? (correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)')
            : 'var(--accent-glow)',
          color: checked
            ? (correct ? 'var(--success)' : 'var(--danger)')
            : 'var(--accent-hover)',
        }}>
          {checked ? (correct ? '✓' : '✗') : index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 10 }}>
            {exercise.q}
          </p>
          <div style={{
            background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 14px',
            border: '1px solid var(--border)', textAlign: 'center', marginBottom: 12,
          }}>
            <LatexRenderer math={exercise.latex} display />
          </div>
        </div>
      </div>

      {/* Hint (before checking) */}
      {!checked && exercise.hint && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={onToggleHint}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
              color: 'var(--accent)', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {hintVisible ? '▾' : '▸'} {t('foundations.showHint')}
          </button>
          {hintVisible && (
            <div style={{
              marginTop: 8, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              {exercise.hint}
            </div>
          )}
        </div>
      )}

      {/* Input + Check (before checking) */}
      {!checked && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="input"
            value={answer}
            onChange={e => onAnswer(e.target.value)}
            placeholder={t('foundations.typeAnswer')}
            style={{ flex: 1, maxWidth: 400 }}
            onKeyDown={e => { if (e.key === 'Enter' && answer.trim()) onCheck(); }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={onCheck}
            disabled={!answer.trim()}
            style={{ borderRadius: 20, padding: '8px 24px' }}
          >
            {t('foundations.checkBtn')}
          </button>
        </div>
      )}

      {/* Results (after checking) */}
      {checked && (
        <div style={{ marginTop: 4 }}>
          {/* Feedback */}
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 10,
            background: correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{correct ? '🎉' : '💪'}</span>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: correct ? 'var(--success)' : 'var(--danger)',
              }}>
                {correct ? t('foundations.correctResult') : t('foundations.incorrectResult')}
              </div>
              {!correct && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {t('foundations.youAnswered')}: <strong>{answer}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Correct answer */}
          <div style={{
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 10,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', marginBottom: 4 }}>
              {t('foundations.answer')}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {exercise.answer}
            </div>
          </div>

          {/* Explanation */}
          <div style={{
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-hover)', textTransform: 'uppercase', marginBottom: 4 }}>
              {t('foundations.explanation')}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {exercise.explanation}
            </p>
          </div>

          {/* Hint (always shown after check) */}
          {exercise.hint && (
            <div style={{
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 4 }}>
                {t('foundations.alternativeMethod')}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {exercise.hint}
              </p>
            </div>
          )}

          {/* Override */}
          {!correct && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn btn-sm"
                onClick={onOverride}
                style={{
                  background: 'rgba(34,197,94,0.08)', color: 'var(--success)',
                  border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '6px 18px',
                  fontSize: 12,
                }}
              >
                {t('foundations.iWasRight')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Category View ───────────────────────────────────────────── */
function CategoryView({ category, onBack, subject, t, lang }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [scores, setScores] = useState({});
  const [showHints, setShowHints] = useState({});

  const exercises = category.exercises;
  const translationMap = subject === 'math' ? mathExerciseTranslations : physicsExerciseTranslations;

  const getExercise = (exercise, index) => {
    const translated = getTranslatedExercises(null, translationMap, lang, category.id, index);
    if (translated) {
      return {
        ...exercise,
        q: translated.q,
        explanation: translated.explanation,
        ...(translated.hint && { hint: translated.hint }),
        ...(translated.answer && { answer: translated.answer }),
        ...(translated.latex && { latex: translated.latex }),
      };
    }
    return exercise;
  };

  const handleCheck = (i, exercise) => {
    const isCorrect = checkUserAnswer(answers[i] || '', exercise.answer);
    setChecked(prev => ({ ...prev, [i]: true }));
    setScores(prev => ({ ...prev, [i]: isCorrect }));
  };

  const handleOverride = (i) => {
    setScores(prev => ({ ...prev, [i]: true }));
  };

  const totalAnswered = Object.keys(checked).length;
  const totalCorrect = Object.values(scores).filter(v => v === true).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ borderRadius: 20 }}>
          ← {t('foundations.back')}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{category.icon}</span>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{category.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{category.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('foundations.progress')}</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {totalAnswered}/{exercises.length} {t('foundations.answered')}
              {totalAnswered > 0 && <span style={{ color: 'var(--success)', marginLeft: 8 }}>
                {totalCorrect} {t('foundations.correct')} ({Math.round(totalCorrect / totalAnswered * 100)}%)
              </span>}
            </span>
          </div>
          <ProgressBar current={totalAnswered} total={exercises.length} color={category.color} />
        </div>
      </div>

      {/* Tip */}
      <div style={{
        background: `${category.color}10`, border: `1px solid ${category.color}30`,
        borderRadius: 12, padding: '14px 18px', marginBottom: 20,
        display: 'flex', gap: 10, alignItems: 'start',
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: category.color, marginBottom: 2, textTransform: 'uppercase' }}>
            {t('foundations.tip')}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {category.tip}
          </p>
        </div>
      </div>

      {/* Exercises */}
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {exercises.map((ex, i) => {
          const translated = getExercise(ex, i);
          return (
            <ExerciseCard
              key={i}
              exercise={translated}
              index={i}
              answer={answers[i] || ''}
              onAnswer={(v) => setAnswers(prev => ({ ...prev, [i]: v }))}
              checked={!!checked[i]}
              correct={scores[i] === true}
              onCheck={() => handleCheck(i, translated)}
              onOverride={() => handleOverride(i)}
              hintVisible={!!showHints[i]}
              onToggleHint={() => setShowHints(prev => ({ ...prev, [i]: !prev[i] }))}
              t={t}
            />
          );
        })}
      </div>

      {/* Completion */}
      {totalAnswered === exercises.length && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(99,102,241,0.08))',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 16, padding: '28px', textAlign: 'center', marginTop: 24,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {t('foundations.categoryComplete')}
          </h3>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            {t('foundations.youGot')} <strong style={{ color: 'var(--success)' }}>{totalCorrect}</strong> {t('foundations.of')} {exercises.length} {t('foundations.exercisesRight')}
            ({Math.round(totalCorrect / exercises.length * 100)}%)
          </p>
          <button className="btn btn-primary" onClick={onBack} style={{ marginTop: 16, borderRadius: 20 }}>
            {t('foundations.backToCategories')}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function Foundations() {
  const { t, lang } = useI18n();
  const [subject, setSubject] = useState('math');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showResources, setShowResources] = useState(false);

  const SUBJECTS = [
    { id: 'math', label: t('foundations.math'), icon: '🔢', data: MATH_FOUNDATIONS, color: '#6366f1' },
    { id: 'physics', label: t('foundations.physics'), icon: '⚛️', data: PHYSICS_FOUNDATIONS, color: '#06b6d4' },
  ];

  const currentData = SUBJECTS.find(s => s.id === subject);
  const categories = currentData.data;

  const catPrefix = subject === 'math' ? 'mathCat' : 'physCat';

  const getTranslatedCategory = (cat) => ({
    ...cat,
    title: t(`${catPrefix}.${cat.id}.title`) || cat.title,
    subtitle: t(`${catPrefix}.${cat.id}.subtitle`) || cat.subtitle,
    description: t(`${catPrefix}.${cat.id}.desc`) || cat.description,
    tip: t(`${catPrefix}.${cat.id}.tip`) || cat.tip,
  });

  // Category view
  if (selectedCategory !== null) {
    const rawCat = categories.find(c => c.id === selectedCategory);
    if (!rawCat) return null;
    const cat = getTranslatedCategory(rawCat);

    return (
      <>
        <div className="page-header">
          <div>
            <h2>{t('foundations.title')}</h2>
            <div className="subtitle">{currentData.label} - {cat.title}</div>
          </div>
        </div>
        <div className="page-body">
          <CategoryView
            category={cat}
            subject={subject}
            onBack={() => setSelectedCategory(null)}
            t={t}
            lang={lang}
          />
        </div>

        {/* Floating resources button */}
        <button
          onClick={() => setShowResources(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 900,
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--accent)', color: 'white', border: 'none',
            cursor: 'pointer', fontSize: 22, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title={t('foundations.resources')}
        >
          📚
        </button>
        <ResourcesPanel show={showResources} onClose={() => setShowResources(false)} t={t} />
      </>
    );
  }

  // Main view
  const totalExercises = categories.reduce((sum, c) => sum + c.exercises.length, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('foundations.title')}</h2>
          <div className="subtitle">{t('foundations.subtitle')}</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowResources(true)}>
          📚 {t('foundations.resources')}
        </button>
      </div>
      <div className="page-body">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(6,182,212,0.08))',
            borderRadius: 16, padding: '28px 32px', marginBottom: 28,
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {t('foundations.heroTitle')}
            </h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600 }}>
              {t('foundations.heroDesc')}
            </p>
          </div>

          {/* Subject toggle */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 24,
            background: 'var(--bg-secondary)', borderRadius: 12, padding: 4,
            border: '1px solid var(--border)',
          }}>
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                  background: subject === s.id ? s.color : 'transparent',
                  color: subject === s.id ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                {s.label}
                <span style={{
                  fontSize: 11, opacity: 0.7,
                  background: subject === s.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
                  padding: '2px 6px', borderRadius: 4,
                }}>
                  {s.data.reduce((sum, c) => sum + c.exercises.length, 0)} {t('foundations.ex')}
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24,
          }}>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: currentData.color }}>
                  {categories.length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('foundations.categories')}</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: currentData.color }}>
                  {totalExercises}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('foundations.exercises')}</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)' }}>
                  100%
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('foundations.free')}</div>
              </div>
            </div>
          </div>

          {/* Category cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {categories.map((rawCat) => {
              const cat = getTranslatedCategory(rawCat);
              return (
                <div
                  key={cat.id}
                  className="card"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = cat.color;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)` }} />
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 24,
                        background: `${cat.color}15`,
                      }}>
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{cat.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.subtitle}</div>
                      </div>
                      <div style={{
                        background: `${cat.color}15`, color: cat.color,
                        fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      }}>
                        {cat.exercises.length}
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ResourcesPanel show={showResources} onClose={() => setShowResources(false)} t={t} />
    </>
  );
}
