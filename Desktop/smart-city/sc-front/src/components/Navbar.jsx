import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/',            key: 'overview',  icon: '🏙️', color: '#64748B' },
  { path: '/transport',   key: 'transport', icon: '🚗', color: '#3B82F6' },
  { path: '/ecology',     key: 'ecology',   icon: '🌿', color: '#10B981' },
  { path: '/safety',      key: 'safety',    icon: '🛡️', color: '#F59E0B' },
  { path: '/utilities',   key: 'utilities', icon: '⚡', color: '#8B5CF6' },
  { path: '/akimat',      key: 'akimat',    icon: '🏛️', color: '#6366F1' },
];

export default function Navbar({ t, lang, setLang, theme, setTheme }) {
  return (
    <nav className="navbar">
      <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <div className="nav-logo-icon">🏙️</div>
        <span className="nav-logo-text">{t.appTitle}</span>
      </a>

      <div className="nav-links">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => isActive ? { color: item.color } : {}}
          >
            {({ isActive }) => (
              <>
                <span className="nl-icon">{item.icon}</span>
                {t.nav[item.key]}
                {isActive && <span className="nl-dot" style={{ background: item.color }} />}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="nav-controls">
        <div className="lang-switcher">
          {['ru', 'en', 'kz'].map(l => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          className="theme-btn"
          onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? t.theme.light : t.theme.dark}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
