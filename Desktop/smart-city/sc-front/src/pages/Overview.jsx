import { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '../components/Drawer';
import MapCard from '../components/MapCard';
import CityScene from '../components/CityScene';

import cityMini from '../assets/city-mini.jpg';
import cityNeon from '../assets/city-neon.jpg';

const kpiData = { overall: 84, safety: { value: 92 } };
const STATUS_COLORS = { normal: '#10B981', warning: '#F59E0B', critical: '#EF4444' };

const CATS = [
  { key: 'transport', icon: '🚗', color: '#3B82F6', path: '/transport' },
  { key: 'ecology',   icon: '🌿', color: '#10B981', path: '/ecology' },
  { key: 'safety',    icon: '🛡️', color: '#F59E0B', path: '/safety' },
  { key: 'utilities', icon: '⚡', color: '#8B5CF6', path: '/utilities' },
];

function FloatCard({ style, label, value, sub, color, delay = 0 }) {
  return (
    <div className="float-card" style={{ ...style, animationDelay: `${delay}s` }}>
      <div className="float-card-label">{label}</div>
      <div className="float-card-val" style={{ color }}>{value}</div>
      {sub && <div className="float-card-sub">{sub}</div>}
    </div>
  );
}

function AMetric({ label, val, unit, goal, color }) {
  return (
    <div className="analysis-metric">
      <div className="am-label">{label}</div>
      <div className="am-val" style={{ color }}>
        {val}<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)' }}>{unit}</span>
      </div>
      {goal && <div className="am-goal">{goal}</div>}
    </div>
  );
}

function SceneLoader() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1e, #1a0f3e)',
      borderRadius: 'inherit',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏙️</div>
        <div style={{ color: '#6366f1', fontSize: 13, fontWeight: 600 }}>Загрузка 3D модели...</div>
      </div>
    </div>
  );
}

export default function Overview({ t, aiData, theme }) {
  const ov = t?.overview;
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState('transport');
  const [drawer, setDrawer] = useState(null);

  if (!ov) return null;

  const isDark = theme === 'dark';
  const overallStatus = kpiData.overall >= 80 ? 'normal' : kpiData.overall >= 60 ? 'warning' : 'critical';
  const sc = STATUS_COLORS[overallStatus];
  const dateStr = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const criticalCount = ov.alerts?.filter(a => a.level === 'critical').length || 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{ov.greeting} Almaty 👋</div>
          <div className="page-subtitle">{ov.city}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{dateStr}</div>
          {criticalCount > 0 && (
            <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 700, marginTop: 2 }}>
              ● {criticalCount} critical alerts
            </div>
          )}
        </div>
      </div>

      {/* Top row: 3D Scene + Analysis */}
      <div className="ov-grid-top">

        {/* 3D City Scene */}
        <div className="hero-card" style={{ minHeight: 460 }}>
          <Suspense fallback={<SceneLoader />}>
            <CityScene isDark={isDark} />
          </Suspense>

          <FloatCard
            style={{ top: 16, right: 16 }}
            label={ov.cityScore}
            value={`${kpiData.overall}/100`}
            sub={ov.statusLabels[overallStatus]}
            color={sc}
          />
          <FloatCard
            style={{ bottom: 100, right: 14 }}
            label="AQI · Температура"
            value={aiData ? `AQI ${aiData.metrics?.aqi}  ${aiData.metrics?.temp ?? '--'}°C` : 'AQI --'}
            sub={aiData ? `${aiData.metrics?.description || ''} · ${aiData.metrics?.humidity ?? '--'}% влажн.` : 'Загрузка...'}
            color={aiData?.metrics?.aqi > 150 ? '#EF4444' : aiData?.metrics?.aqi > 100 ? '#F59E0B' : '#10B981'}
            delay={0.5}
          />

          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 16px',
            background: 'linear-gradient(to top, rgba(13,11,30,.9) 0%, transparent 100%)',
          }}>
            <div className="cat-thumbs">
              {CATS.map(c => (
                <button
                  key={c.key}
                  className={`cat-thumb ${activeCat === c.key ? 'active' : ''}`}
                  style={{ color: c.color }}
                  onClick={() => setActiveCat(c.key)}
                >
                  <span className="cat-thumb-icon">{c.icon}</span>
                  <span className="cat-thumb-name">{t.nav[c.key]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Analysis + Alerts + AI */}
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 16 }}>
          {/* Analysis metrics */}
          <div className="card analysis-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="icon-circle" style={{ background: 'rgba(99,102,241,.12)', fontSize: 18 }}>📊</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700 }}>City Analysis</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{aiData ? 'Live Data' : 'System Ready'}</div>
                </div>
              </div>
              <button className="detail-btn" onClick={() => setDrawer('analysis')}>{ov.detailBtn} →</button>
            </div>
            <div className="analysis-metrics">
              <AMetric label={ov.cityScore} val={kpiData.overall} unit="/100" goal={ov.statusLabels[overallStatus]} color={sc} />
              <AMetric label="Traffic Flow" val={aiData?.metrics?.traffic || '–'} unit=" bal" goal="Мониторинг" color="#3B82F6" />
              <AMetric label="Safety Index" val={kpiData.safety.value} unit="%" goal="Stable" color="#10B981" />
            </div>
          </div>

          {/* Alerts + AI side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Alerts */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>
                {ov.alertsTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ov.alerts?.map((a, i) => (
                  <div key={i} className="incident-row" style={{ padding: '9px 12px' }}>
                    <span className={`sev-dot ${a.level}`} />
                    <div className="incident-title" style={{ fontSize: 12 }}>{a.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI report */}
            <div className="card" style={{
              padding: 20,
              display: 'flex', flexDirection: 'column', gap: 14,
              border: aiData?.ai_report?.status === 'Critical'
                ? '1px solid rgba(239,68,68,.4)'
                : '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="icon-circle" style={{ background: 'rgba(99,102,241,.12)' }}>🤖</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700 }}>{ov.aiTitle}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, flex: 1 }}>
                {aiData ? (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{aiData.ai_report?.what_is_happening}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>💡 {aiData.ai_report?.recommendation}</div>
                  </>
                ) : 'Ожидание данных от сервера аналитики...'}
              </div>
              <button className="detail-btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setDrawer('ai')}>
                {aiData ? `Статус: ${aiData.ai_report?.criticality}` : 'Загрузка...'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Transport, Ecology, Map */}
      <div className="ov-grid-bottom">
        <div className="img-feature-card" onClick={() => navigate('/transport')}>
          <img src={cityMini} alt="Traffic" />
          <div className="img-feature-overlay">
            <div className="img-feature-title">🚗 {t.nav.transport}</div>
          </div>
        </div>

        <div className="img-feature-card" onClick={() => navigate('/ecology')}>
          <img src={cityNeon} alt="Air Quality" />
          <div className="img-feature-overlay">
            <div className="img-feature-title">🌿 {t.nav.ecology}</div>
          </div>
        </div>

        <div className="map-card" style={{ minHeight: 280 }}>
          <MapCard isDark={isDark} />
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer === 'ai' ? ov.aiTitle : 'Analysis'}>
        <div style={{ padding: 20 }}>
          {drawer === 'ai' ? (
            <div>
              <h4 style={{ marginBottom: 10 }}>Рекомендация ИИ:</h4>
              <p>{aiData?.ai_report?.recommendation || 'Данные скоро появятся'}</p>
            </div>
          ) : 'Подробная статистика систем города Алматы.'}
        </div>
      </Drawer>
    </div>
  );
}
