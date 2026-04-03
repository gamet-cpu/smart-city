import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { trafficData } from '../data/mockData';
import Drawer from '../components/Drawer';
import cityMini from '../assets/city-mini.jpg';

const STATUS_COLORS = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };
const STATUS_BG     = { critical: 'rgba(239,68,68,.1)', warning: 'rgba(245,158,11,.1)', normal: 'rgba(16,185,129,.1)' };

const TooltipStyle = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 10, fontSize: 12, padding: '8px 12px',
  color: 'var(--text-1)', boxShadow: 'var(--shadow)',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TooltipStyle}>
      <div style={{ color: 'var(--text-3)', marginBottom: 4, fontSize: 11 }}>{label}:00</div>
      <div style={{ fontWeight: 700 }}>{payload[0]?.value?.toLocaleString()} vehicles</div>
    </div>
  );
}

export default function TransportPage({ t }) {
  const tr = t.transport;
  const [drawer, setDrawer] = useState(false);
  const [range, setRange] = useState('24h');

  const RANGES = ['24h', '7d', '30d'];

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link to="/" className="back-btn" style={{ display: 'inline-flex' }}>{t.back}</Link>
          </div>
          <div className="page-title">🚗 {tr.title}</div>
          <div className="page-subtitle">{tr.sub}</div>
        </div>
        <button className="detail-btn primary" onClick={() => setDrawer(true)}>
          {t.detailBtn} →
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {tr.stats.map((s, i) => (
          <div key={i} className="stat-chip">
            <span className="stat-chip-label">{s.label}</span>
            <span className="stat-chip-value">{s.value}</span>
            <span className={`stat-chip-trend ${s.up ? 'up' : 'down'}`}>
              {s.up ? '▲' : '▼'} {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* 3D Hero image */}
      <div className="img-feature-card" style={{ marginBottom: 16, height: 200 }}>
        <img src={cityMini} alt="City Traffic" />
        <div className="img-feature-overlay">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <div className="img-feature-title">🚗 {tr.title}</div>
              <div className="img-feature-sub">Live traffic monitoring · Almaty</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: '84k', l: 'Vehicles' }, { v: '5', l: 'Incidents' }, { v: '62%', l: 'Load' }].map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '8px 12px', background: 'rgba(255,255,255,.15)', borderRadius: 10, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-head)', color: '#fff' }}>{m.v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.7)' }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="img-feature-badge" style={{ background: 'rgba(239,68,68,.75)' }}>⚠ Warning</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Traffic chart — functional */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{tr.chartTitle}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="detail-btn"
                  style={range === r ? { background: '#3B82F6', color: '#fff', borderColor: 'transparent' } : {}}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-3)' }} tickFormatter={v => `${v}h`} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="cars" stroke="#3B82F6" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Routes — functional */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{tr.routesTitle}</div>
          {tr.routes.map((r, i) => (
            <div key={i} className="route-row">
              <div className="sev-dot" style={{ background: STATUS_COLORS[r.status] }} />
              <div className="route-name">{r.name}</div>
              <span style={{ fontSize: 12, color: STATUS_COLORS[r.status], fontWeight: 600 }}>{r.load}</span>
              <span
                className="route-status-badge"
                style={{ background: STATUS_BG[r.status], color: STATUS_COLORS[r.status] }}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Incidents list — functional */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{tr.incidentsTitle}</div>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{tr.incidents.length} active</span>
        </div>
        <div className="incident-list">
          {tr.incidents.map((inc, i) => (
            <div key={i} className="incident-row">
              <div className={`sev-dot ${inc.sev}`} />
              <div className="incident-info">
                <div className="incident-title">{inc.title}</div>
                <div className="incident-sub">{inc.sub}</div>
              </div>
              <span className="incident-time">{inc.time}</span>
              <button className="detail-btn" style={{ fontSize: 11, padding: '4px 10px' }}>
                {t.actionBtn}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={tr.drawerTitle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tr.drawerStats.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.label}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
          <div style={{ padding: '14px 16px', background: 'rgba(59,130,246,.07)', borderRadius: 10, border: '1px solid rgba(59,130,246,.2)' }}>
            <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 700, marginBottom: 6 }}>AI SUGGESTION</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Reroute traffic via Abai Ave. Expected 18% congestion reduction. Activate alternate signal timing for Saryarka Ave.
            </div>
          </div>
          <button className="detail-btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            ⚡ {t.actionBtn}
          </button>
        </div>
      </Drawer>
    </div>
  );
}
