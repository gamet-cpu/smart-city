import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { aqiTrendData } from '../data/mockData';
import Drawer from '../components/Drawer';
import cityNeon from '../assets/city-neon.jpg';

const STATUS_COLORS = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };
const STATUS_BG     = { critical: 'rgba(239,68,68,.1)', warning: 'rgba(245,158,11,.1)', normal: 'rgba(16,185,129,.1)' };

function AQIGauge({ value }) {
  const max = 300;
  const pct = Math.min(value / max, 1);
  const angle = -135 + pct * 270;
  const color = value < 50 ? '#10B981' : value < 100 ? '#84CC16' : value < 150 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 160, height: 100 }}>
        <svg width="160" height="100" viewBox="0 0 160 100">
          <path d="M 16 96 A 64 64 0 1 1 144 96" fill="none" stroke="var(--border)" strokeWidth="12" strokeLinecap="round"/>
          <path
            d="M 16 96 A 64 64 0 1 1 144 96"
            fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${pct * 201} 201`}
            style={{ transition: 'stroke-dasharray .8s ease, stroke .4s' }}
          />
          <line
            x1="80" y1="96" x2="80" y2="44"
            stroke={color} strokeWidth="3" strokeLinecap="round"
            style={{ transformOrigin: '80px 96px', transform: `rotate(${angle - 90}deg)`, transition: 'transform .8s ease' }}
          />
          <circle cx="80" cy="96" r="6" fill={color}/>
        </svg>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>AQI</div>
    </div>
  );
}

const TooltipStyle = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 10, fontSize: 12, padding: '8px 12px',
  color: 'var(--text-1)', boxShadow: 'var(--shadow)',
};

export default function EcologyPage({ t }) {
  const ec = t.ecology;
  const [drawer, setDrawer] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link to="/" className="back-btn" style={{ display: 'inline-flex' }}>{t.back}</Link>
          </div>
          <div className="page-title">🌿 {ec.title}</div>
          <div className="page-subtitle">{ec.sub}</div>
        </div>
        <button className="detail-btn primary" onClick={() => setDrawer(true)}>
          {t.detailBtn} →
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {ec.stats.map((s, i) => (
          <div key={i} className="stat-chip">
            <span className="stat-chip-label">{s.label}</span>
            <span className="stat-chip-value">{s.value}</span>
            <span className={`stat-chip-trend ${s.up ? 'up' : 'down'}`}>
              {s.up ? '▲' : '▼'} {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* 3D Hero image — air/pollution visual */}
      <div className="img-feature-card" style={{ marginBottom: 16, height: 200 }}>
        <img src={cityNeon} alt="Air Quality" style={{ filter: 'saturate(1.2)' }} />
        <div className="img-feature-overlay" style={{ background: 'linear-gradient(to top, rgba(30,10,0,.85) 0%, rgba(0,0,0,.05) 60%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <div className="img-feature-title">🌿 {ec.title}</div>
              <div className="img-feature-sub">Environmental monitoring · Almaty</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: '112', l: 'AQI' }, { v: '187', l: 'PM2.5' }, { v: '418', l: 'CO₂' }].map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '8px 12px', background: 'rgba(245,158,11,.25)', borderRadius: 10, backdropFilter: 'blur(8px)', border: '1px solid rgba(245,158,11,.4)' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-head)', color: '#fff' }}>{m.v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.75)' }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="img-feature-badge" style={{ background: 'rgba(245,158,11,.8)' }}>⚠ Unhealthy</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* AQI Gauge card — functional */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{ec.aqiTitle}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <AQIGauge value={112} />
            <div style={{ padding: '8px 20px', background: 'var(--c-critical-bg)', borderRadius: 20, color: 'var(--c-critical)', fontWeight: 700, fontSize: 13 }}>
              {ec.aqiStatus}
            </div>
          </div>
          <div style={{ marginTop: 16, height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aqiTrendData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length
                      ? <div style={TooltipStyle}>AQI: <strong>{payload[0].value}</strong></div>
                      : null
                  }
                />
                <Area type="monotone" dataKey="aqi" stroke="#F59E0B" strokeWidth={2} fill="url(#aqiGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <button className="detail-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => setDrawer(true)}>
            {t.detailBtn} →
          </button>
        </div>

        {/* Sensors grid — functional */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{ec.sensorsTitle}</div>
          <div className="grid-2" style={{ gap: 10 }}>
            {ec.sensors.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: STATUS_BG[s.status],
                  border: `1px solid ${STATUS_COLORS[s.status]}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'opacity .15s',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: STATUS_COLORS[s.status] }}>{s.aqi}</div>
                </div>
                <div className={`sev-dot ${s.status}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts — functional */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{ec.alertsTitle}</div>
        <div className="incident-list">
          {ec.alerts.map((a, i) => (
            <div key={i} className="incident-row">
              <div className={`sev-dot ${a.sev}`} />
              <div className="incident-info">
                <div className="incident-title">{a.title}</div>
                <div className="incident-sub">{a.sub}</div>
              </div>
              {a.sev !== 'normal' && (
                <button className="detail-btn" style={{ fontSize: 11, padding: '4px 10px', borderColor: STATUS_COLORS[a.sev], color: STATUS_COLORS[a.sev] }}>
                  {t.actionBtn}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={ec.drawerTitle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'PM2.5', value: '187 μg/m³', warn: true },
            { label: 'PM10', value: '142 μg/m³', warn: true },
            { label: 'CO₂', value: '418 ppm', warn: false },
            { label: 'NO₂', value: '32 μg/m³', warn: false },
            { label: 'O₃', value: '28 μg/m³', warn: false },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{row.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: row.warn ? '#EF4444' : '#10B981' }}>{row.value}</span>
            </div>
          ))}
          <button className="detail-btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            🌿 Activate Filtration Protocol
          </button>
        </div>
      </Drawer>
    </div>
  );
}
