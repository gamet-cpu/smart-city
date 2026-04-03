import { useState } from 'react';
import { Link } from 'react-router-dom';
import Drawer from '../components/Drawer';

const STATUS_COLORS = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };
const STATUS_BG     = { critical: 'rgba(239,68,68,.1)', warning: 'rgba(245,158,11,.1)', normal: 'rgba(16,185,129,.1)' };

export default function UtilitiesPage({ t }) {
  const ut = t.utilities;
  const [drawer, setDrawer] = useState(false);
  const [activeResource, setActiveResource] = useState(null);

  const handleResourceClick = (r) => {
    setActiveResource(r);
    setDrawer(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link to="/" className="back-btn" style={{ display: 'inline-flex' }}>{t.back}</Link>
          </div>
          <div className="page-title">⚡ {ut.title}</div>
          <div className="page-subtitle">{ut.sub}</div>
        </div>
        <button className="detail-btn primary" onClick={() => setDrawer(true)}>
          {t.detailBtn} →
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {ut.stats.map((s, i) => (
          <div key={i} className="stat-chip">
            <span className="stat-chip-label">{s.label}</span>
            <span className="stat-chip-value">{s.value}</span>
            <span className={`stat-chip-trend ${s.up ? 'up' : 'down'}`}>
              {s.up ? '▲' : '▼'} {s.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Resource cards — functional (click to open drawer) */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{ut.resourcesTitle}</div>
          <div className="grid-2" style={{ gap: 10 }}>
            {ut.resources.map((r, i) => (
              <div
                key={i}
                className="card interactive"
                style={{ padding: '16px', cursor: 'pointer', border: '1px solid var(--border)' }}
                onClick={() => handleResourceClick(r)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  <div className={`sev-dot ${r.status}`} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>{r.name}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: r.color, marginBottom: 8 }}>{r.value}%</div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${r.value}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance schedule — functional */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{ut.maintenanceTitle}</div>
          <div className="incident-list">
            {ut.maintenance.map((m, i) => (
              <div key={i} className="incident-row">
                <div className={`sev-dot ${m.sev}`} />
                <div className="incident-info">
                  <div className="incident-title">{m.title}</div>
                  <div className="incident-sub">{m.date}</div>
                </div>
                {m.sev !== 'normal' && (
                  <button
                    className="detail-btn"
                    style={{ fontSize: 11, padding: '4px 10px', borderColor: STATUS_COLORS[m.sev], color: STATUS_COLORS[m.sev] }}
                  >
                    {t.detailBtn}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Budget mini */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
              Budget Overview
            </div>
            {[
              { label: 'Allocated', value: '₸ 7.1B', color: '#8B5CF6' },
              { label: 'Spent (Q1)', value: '₸ 2.3B', color: '#3B82F6' },
              { label: 'Remaining', value: '₸ 4.8B', color: '#10B981' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={activeResource ? activeResource.name : ut.drawerTitle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeResource && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 36 }}>{activeResource.icon}</span>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: activeResource.color }}>{activeResource.value}%</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Current capacity</div>
                </div>
              </div>
              <div className="prog-track" style={{ height: 12 }}>
                <div className="prog-fill" style={{ width: `${activeResource.value}%`, background: activeResource.color }} />
              </div>
            </>
          )}
          {[
            { label: 'Daily consumption', value: '24,800 units' },
            { label: 'Peak load', value: '18:00–20:00' },
            { label: 'Maintenance due', value: 'Apr 15' },
            { label: 'System uptime', value: '99.7%' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{row.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
          <button className="detail-btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            ⚙️ {t.actionBtn}
          </button>
        </div>
      </Drawer>
    </div>
  );
}
