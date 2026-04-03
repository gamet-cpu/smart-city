import { useState, useEffect } from 'react';
import { kpiData } from '../data/mockData';

const MINI_BARS = [3, 5, 4, 7, 6, 8, 5];

function KpiChip({ label, value, status, color }) {
  const heights = [40, 60, 50, 80, 70, 90, 65];
  return (
    <div className="kpi-chip">
      <div className="kpi-chip-bar">
        {heights.map((h, i) => (
          <span key={i} style={{ height: `${h}%`, background: color }} />
        ))}
      </div>
      <span className="kpi-chip-label">{label}</span>
      <span className="kpi-chip-value" style={{ color }}>{value}%</span>
      <span className={`status-dot ${status}`} />
    </div>
  );
}

function CityRing({ value }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="ring-wrap">
      <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <span className="ring-label" style={{ color }}>{value}</span>
    </div>
  );
}

export default function TopBar({ t, lang, setLang, theme, setTheme }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const chips = [
    { key: 'transport', color: '#3b82f6' },
    { key: 'ecology',   color: '#22c55e' },
    { key: 'safety',    color: '#f59e0b' },
    { key: 'utilities', color: '#a78bfa' },
  ];

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <div className="topbar-logo-icon">🏙️</div>
        <span className="topbar-logo-text">{t.appTitle}</span>
      </div>

      <div className="divider" />

      <div className="topbar-kpis">
        {chips.map(c => (
          <KpiChip
            key={c.key}
            label={t.kpi[c.key]}
            value={kpiData[c.key].value}
            status={kpiData[c.key].status}
            color={c.color}
          />
        ))}

        <div className="divider" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CityRing value={kpiData.overall} />
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t.cityStatus}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
              {kpiData.overall}/100
            </div>
          </div>
        </div>
      </div>

      <div className="topbar-controls">
        <span className="timestamp">{t.lastUpdated}: {tick}s</span>
        <div className="divider" />

        <div className="lang-switcher">
          {['ru', 'en', 'kz'].map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
          {theme === 'dark' ? t.theme.light : t.theme.dark}
        </button>
      </div>
    </div>
  );
}
