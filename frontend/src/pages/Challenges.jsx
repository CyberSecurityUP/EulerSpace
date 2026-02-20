import { useState, useEffect, useRef } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';
import { getExercises } from '../services/api';

export default function Challenges() {
  const { t } = useI18n();
  const [difficulty, setDifficulty] = useState('medium');
  const [topic, setTopic] = useState('derivatives');
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startChallenge = async () => {
    try {
      const res = await getExercises(topic, difficulty, 5);
      setProblems(res.data);
      setCurrent(0);
      setScore(0);
      setTotal(0);
      setAnswer('');
      setRevealed(false);
      setTimer(0);
      setRunning(true);
    } catch (err) {
      console.error(err);
    }
  };

  const checkAnswer = () => {
    setRevealed(true);
    setTotal(prev => prev + 1);
  };

  const next = () => {
    if (current < problems.length - 1) {
      setCurrent(prev => prev + 1);
      setAnswer('');
      setRevealed(false);
    } else {
      setRunning(false);
    }
  };

  const markCorrect = () => {
    setScore(prev => prev + 1);
    next();
  };

  const problem = problems[current];

  const DIFFICULTIES = [
    { key: 'easy', label: t('ai.easy') },
    { key: 'medium', label: t('ai.medium') },
    { key: 'hard', label: t('ai.hard') },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('challenges.title')}</h2>
          <div className="subtitle">{t('challenges.subtitle')}</div>
        </div>
        {running && <div className="challenge-timer">{formatTime(timer)}</div>}
      </div>
      <div className="page-body">
        {problems.length === 0 || !running ? (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card">
              <div className="card-header">{t('challenges.configure')}</div>
              <div className="card-body">
                <div className="input-group">
                  <label>{t('challenges.topic')}</label>
                  <select className="input" value={topic} onChange={e => setTopic(e.target.value)}>
                    <option value="derivatives">{t('ai.derivatives')}</option>
                    <option value="integrals">{t('ai.integrals')}</option>
                    <option value="equations">{t('ai.equations')}</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>{t('challenges.difficulty')}</label>
                  <div className="difficulty-selector">
                    {DIFFICULTIES.map(d => (
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

                <button
                  className="btn btn-primary"
                  onClick={startChallenge}
                  style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                >
                  {t('challenges.startChallenge')}
                </button>

                {total > 0 && (
                  <div className="result-box" style={{ marginTop: 16 }}>
                    <div className="result-label">{t('challenges.lastResult')}</div>
                    <div className="result-value">
                      {score}/{total} {t('challenges.correct')} {formatTime(timer)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {problems.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: i < current ? 'var(--success)' :
                      i === current ? 'var(--accent)' : 'var(--border)',
                  }}
                />
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                {t('challenges.problem')} {current + 1} / {problems.length}
                <span className="badge" style={{ marginLeft: 'auto' }}>{difficulty}</span>
              </div>
              <div className="card-body" style={{ textAlign: 'center', padding: 30 }}>
                <div style={{ fontSize: 22, marginBottom: 24 }}>
                  <LatexRenderer math={problem.problem_latex} display />
                </div>

                {!revealed && (
                  <>
                    <div className="input-group" style={{ maxWidth: 400, margin: '0 auto' }}>
                      <input
                        className="input"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder={t('challenges.yourAnswer')}
                        onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                        style={{ textAlign: 'center', fontSize: 16 }}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={checkAnswer} style={{ marginTop: 12 }}>
                      {t('challenges.check')}
                    </button>
                  </>
                )}

                {revealed && (
                  <div style={{ marginTop: 16 }}>
                    <div className="result-box">
                      <div className="result-label">{t('challenges.correctAnswer')}</div>
                      <div className="result-value" style={{ fontSize: 18 }}>
                        <LatexRenderer math={problem.answer} display />
                      </div>
                    </div>
                    <div className="btn-group" style={{ justifyContent: 'center', marginTop: 16 }}>
                      <button className="btn btn-primary" onClick={markCorrect}>
                        {t('challenges.gotItRight')}
                      </button>
                      <button className="btn btn-secondary" onClick={next}>
                        {t('challenges.wrongNext')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
              <div className="badge badge-success">{t('foundations.score')}: {score}/{total}</div>
              <div className="badge">Time: {formatTime(timer)}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
