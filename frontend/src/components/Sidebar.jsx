import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n, LANG_META } from '../i18n/context';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang, SUPPORTED_LANGS } = useI18n();

  const modules = [
    { label: t('sidebar.home'), items: [
      { path: '/', icon: '🏠', name: t('sidebar.dashboard') },
    ]},
    { label: t('sidebar.learn'), items: [
      { path: '/foundations', icon: '🚀', name: t('sidebar.foundations'), tag: 'NEW' },
      { path: '/academy', icon: '🎓', name: t('sidebar.academy') },
      { path: '/formulas', icon: '📋', name: t('sidebar.formulas') },
    ]},
    { label: t('sidebar.tools'), items: [
      { path: '/editor', icon: '✏️', name: t('sidebar.editor') },
      { path: '/calculator', icon: '🧮', name: t('sidebar.calculator') },
      { path: '/graphs', icon: '📊', name: t('sidebar.visualization') },
    ]},
    { label: t('sidebar.science'), items: [
      { path: '/physics', icon: '⚛️', name: t('sidebar.physicsLab') },
      { path: '/crypto', icon: '🔐', name: t('sidebar.cryptoLab'), tag: 'NEW' },
      { path: '/quantum', icon: '💠', name: t('sidebar.quantumLab'), tag: 'NEW' },
      { path: '/ai', icon: '🤖', name: t('sidebar.aiAssistant') },
    ]},
    { label: t('sidebar.advanced'), items: [
      { path: '/research', icon: '🧠', name: t('sidebar.research') },
      { path: '/challenges', icon: '🏆', name: t('sidebar.challenges') },
    ]},
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">E</div>
          <h1>EulerSpace</h1>
        </div>
        <div className="sidebar-subtitle">{t('sidebar.subtitle')}</div>
      </div>
      <nav className="sidebar-nav">
        {modules.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
              <div
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.tag && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                    background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
                    letterSpacing: 0.3,
                  }}>
                    {item.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Language Selector */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'center', gap: 4,
      }}>
        {SUPPORTED_LANGS.map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              background: lang === l ? 'var(--accent-glow)' : 'transparent',
              border: lang === l ? '1px solid var(--accent)' : '1px solid transparent',
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontSize: 12, fontWeight: lang === l ? 600 : 400,
              color: lang === l ? 'var(--accent-hover)' : 'var(--text-muted)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span style={{ fontSize: 14 }}>{LANG_META[l].flag}</span>
            <span>{LANG_META[l].label}</span>
          </button>
        ))}
      </div>

      {/* Creator Credits */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-muted)',
        textAlign: 'center',
        lineHeight: 1.6,
        flexShrink: 0,
      }}>
        <div style={{ marginBottom: 4 }}>
          {t('sidebar.createdBy')}
        </div>
        <a
          href="https://joasantonio.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--accent-hover)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 12,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.target.style.color = '#a5b4fc'}
          onMouseLeave={e => e.target.style.color = 'var(--accent-hover)'}
        >
          joasantonio.com
        </a>
        <div style={{ marginTop: 6, fontSize: 10, opacity: 0.5 }}>
          EulerSpace v0.2.0
        </div>
      </div>
    </aside>
  );
}
