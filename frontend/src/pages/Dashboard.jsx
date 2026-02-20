import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/context';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const MODULES = [
    { title: t('sidebar.foundations'), desc: t('dashboard.learnFromZeroDesc'), icon: '🚀', path: '/foundations', color: '#f43f5e', tag: 'NEW' },
    { title: t('sidebar.academy'), desc: t('dashboard.academyDesc'), icon: '🎓', path: '/academy', color: '#22c55e' },
    { title: t('sidebar.editor'), desc: t('dashboard.editorDesc'), icon: '✏️', path: '/editor', color: '#6366f1' },
    { title: t('sidebar.calculator'), desc: t('dashboard.calcDesc'), icon: '🧮', path: '/calculator', color: '#06b6d4' },
    { title: t('sidebar.visualization'), desc: t('dashboard.vizDesc'), icon: '📊', path: '/graphs', color: '#a855f7' },
    { title: t('sidebar.physicsLab'), desc: t('dashboard.physDesc'), icon: '⚛️', path: '/physics', color: '#f97316' },
    { title: t('sidebar.aiAssistant'), desc: t('dashboard.aiDesc'), icon: '🤖', path: '/ai', color: '#ec4899' },
    { title: t('sidebar.formulas'), desc: t('dashboard.formulasDesc'), icon: '📋', path: '/formulas', color: '#14b8a6' },
    { title: t('sidebar.research'), desc: t('dashboard.researchDesc'), icon: '🧠', path: '/research', color: '#8b5cf6' },
    { title: t('sidebar.challenges'), desc: t('dashboard.challengesDesc'), icon: '🏆', path: '/challenges', color: '#eab308' },
  ];

  const QUICK_ACTIONS = [
    { label: t('dashboard.quickStartZero'), path: '/foundations' },
    { label: t('dashboard.quickSolve'), path: '/calculator' },
    { label: t('dashboard.quickPlot'), path: '/graphs' },
    { label: t('dashboard.quickPractice'), path: '/challenges' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('dashboard.welcome')}</h2>
          <div className="subtitle">{t('dashboard.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        {/* Hero */}
        <div className="card" style={{
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))',
          borderColor: 'rgba(99,102,241,0.2)',
        }}>
          <div className="card-body" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                  {t('dashboard.heroTitle')}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.6 }}>
                  {t('dashboard.heroDesc')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => navigate('/academy')}>
                  {t('dashboard.startLearning')}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/calculator')}>
                  {t('dashboard.openCalculator')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.label}
              className="btn btn-secondary"
              onClick={() => navigate(a.path)}
              style={{ flex: '1 1 auto', justifyContent: 'center', minWidth: 140 }}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Modules Grid */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t('dashboard.modules')}</h3>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {MODULES.map(mod => (
            <div
              key={mod.path}
              className="card"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => navigate(mod.path)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = mod.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  background: `${mod.color}15`, flexShrink: 0,
                }}>
                  {mod.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{mod.title}</span>
                    {mod.tag && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: `${mod.color}20`, color: mod.color, textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        {mod.tag}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    {mod.desc}
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
