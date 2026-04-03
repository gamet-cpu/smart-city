import { useState } from 'react';
import { Link } from 'react-router-dom';
import Drawer from '../components/Drawer';

const STATUS_COLORS = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };
const STATUS_BG     = { critical: 'rgba(239,68,68,.1)', warning: 'rgba(245,158,11,.1)', normal: 'rgba(16,185,129,.1)' };

export default function SafetyPage({ t }) {
  const sf = t.safety;
  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link to="/" className="back-btn" style={{ display: 'inline-flex' }}>{t.back}</Link>
          </div>
          <div className="page-title">🛡️ {sf.title}</div>
          <div className="page-subtitle">{sf.sub}</div>
        </div>
        <button className="detail-btn primary" onClick={() => setDrawer(true)}>
          {t.detailBtn} →
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {sf.stats.map((s, i) => (
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
        {/* Incidents — functional */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{sf.incidentsTitle}</div>
          <div className="incident-list">
            {sf.incidents.map((inc, i) => (
              <div
                key={i} className="incident-row"
                style={{ cursor: 'pointer', background: selected === i ? 'var(--card)' : undefined }}
                onClick={() => { setSelected(i); setDrawer(true); }}
              >
                <div className={`sev-dot ${inc.sev}`} />
                <div className="incident-info">
                  <div className="incident-title">{inc.title}</div>
                  <div className="incident-sub">{inc.sub}</div>
                </div>
                <span className="incident-time">{inc.time}</span>
                <button
                  className="detail-btn"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={e => { e.stopPropagation(); setSelected(i); setDrawer(true); }}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Patrol coverage — functional */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{sf.patrolTitle}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sf.patrols.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: STATUS_COLORS[p.status] }}>{p.coverage}%</span>
                </div>
                <div className="prog-track">
                  <div
                    className="prog-fill"
                    style={{ width: `${p.coverage}%`, background: STATUS_COLORS[p.status] }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{sf.cameraTitle}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const status = i === 4 ? 'critical' : i === 8 ? 'warning' : 'normal';
                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1', borderRadius: 8,
                      background: STATUS_BG[status],
                      border: `1px solid ${STATUS_COLORS[status]}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title={`Camera ${i + 1} — ${status}`}
                  >
                    📷
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={sf.drawerTitle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selected !== null && sf.incidents[selected] && (
            <>
              <div style={{ padding: '14px 16px', background: STATUS_BG[sf.incidents[selected].sev], borderRadius: 12, border: `1px solid ${STATUS_COLORS[sf.incidents[selected].sev]}44` }}>
                <div style={{ fontSize: 12, color: STATUS_COLORS[sf.incidents[selected].sev], fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                  {sf.incidents[selected].sev}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{sf.incidents[selected].title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{sf.incidents[selected].sub}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="detail-btn primary" style={{ flex: 1, justifyContent: 'center', padding: 10 }}>
                  🛡️ Dispatch Unit
                </button>
                <button className="detail-btn" style={{ flex: 1, justifyContent: 'center', padding: 10 }}>
                  📋 Log Report
                </button>
              </div>
            </>
          )}
          {[
            { label: 'Total cameras', value: '1,240' },
            { label: 'Offline cameras', value: '14' },
            { label: 'Avg response', value: '4.2 min' },
            { label: 'Resolved today', value: '5' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{row.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
