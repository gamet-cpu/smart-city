import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '../components/Drawer';

// Картинки (убедись, что они лежат в src/assets/)
import cityIso from '../assets/city-iso.png';
import cityMini from '../assets/city-mini.jpg';
import cityNeon from '../assets/city-neon.jpg';

// Заглушка данных, если основной файл mockData недоступен
const kpiData = {
  overall: 84,
  safety: { value: 92 }
};

const STATUS_COLORS = { normal: '#10B981', warning: '#F59E0B', critical: '#EF4444' };

const CATS = [
  { key: 'transport', icon: '🚗', color: '#3B82F6', path: '/transport', img: cityMini },
  { key: 'ecology',   icon: '🌿', color: '#10B981', path: '/ecology',   img: cityNeon },
  { key: 'safety',    icon: '🛡️', color: '#F59E0B', path: '/safety',    img: null },
  { key: 'utilities', icon: '⚡', color: '#8B5CF6', path: '/utilities', img: null },
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
      <div className="am-val" style={{ color }}>{val}<span style={{ fontSize: 14 }}>{unit}</span></div>
      {goal && <div className="am-goal">{goal}</div>}
    </div>
  );
}

export default function Overview({ t, aiData }) {
  const ov = t?.overview;
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState('transport');
  const [drawer, setDrawer] = useState(null);

  if (!ov) return null;

  const overallStatus = kpiData.overall >= 80 ? 'normal' : kpiData.overall >= 60 ? 'warning' : 'critical';
  const sc = STATUS_COLORS[overallStatus];
  const dateStr = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">{ov.greeting} Almaty 👋</div>
          <div className="page-subtitle">{ov.city}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{dateStr}</div>
          <div style={{ fontSize: 12, color: 'var(--c-critical)', fontWeight: 600, marginTop: 2 }}>
            ● {ov.alerts?.filter(a => a.level === 'critical').length || 0} critical alerts
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 16, marginBottom: 16 }}>
        <div className="hero-card" style={{ minHeight: 460 }}>
          <img src={cityIso} alt="Smart City" className="hero-img contain" style={{ height: '100%', minHeight: 380 }} />
          
          <FloatCard
            style={{ top: 16, right: 16 }}
            label={ov.cityScore}
            value={`${kpiData.overall}/100`}
            sub={ov.statusLabels[overallStatus]}
            color={sc}
          />

          <FloatCard
            style={{ bottom: 100, right: 14 }}
            label="Air Quality"
            value={aiData ? `AQI ${aiData.weather?.air_quality}` : "AQI --"}
            sub={aiData?.ai_report?.status || "Analyzing..."}
            color={aiData?.ai_report?.status === 'Critical' ? '#EF4444' : '#F59E0B'}
            delay={0.5}
          />

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(to top, var(--bg-page) 0%, transparent 100%)' }}>
            <div className="cat-thumbs">
              {CATS.map(c => (
                <button key={c.key} className={`cat-thumb ${activeCat === c.key ? 'active' : ''}`} style={{ color: c.color }} onClick={() => setActiveCat(c.key)}>
                  <span className="cat-thumb-icon">{c.icon}</span>
                  <span className="cat-thumb-name">{t.nav[c.key]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 16 }}>
          <div className="card analysis-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="icon-circle" style={{ background: 'rgba(59,130,246,.1)', fontSize: 18 }}>📊</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700 }}>City Analysis</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{aiData ? "Live Data" : "System Ready"}</div>
                </div>
              </div>
              <button className="detail-btn" onClick={() => setDrawer('analysis')}>{ov.detailBtn} →</button>
            </div>

            <div className="analysis-metrics">
              <AMetric label={ov.cityScore} val={kpiData.overall} unit="/100" goal={ov.statusLabels[overallStatus]} color={sc} />
              <AMetric label="Traffic Flow" val={aiData?.traffic?.congestion || "24"} unit="%" goal="Optimal" color="#3B82F6" />
              <AMetric label="Safety Index" val={kpiData.safety.value} unit="%" goal="Stable" color="#10B981" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{ov.alertsTitle}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ov.alerts?.map((a, i) => (
                  <div key={i} className="incident-row" style={{ padding: '9px 12px' }}>
                    <span className={`sev-dot ${a.level}`} />
                    <div className="incident-title" style={{ fontSize: 12 }}>{a.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ 
              padding: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 14,
              border: aiData?.ai_report?.status === 'Critical' ? '1px solid #ef4444' : '1px solid var(--border)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="icon-circle" style={{ background: 'rgba(59,130,246,.1)' }}>🤖</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700 }}>{ov.aiTitle}</div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, flex: 1 }}>
                {aiData ? (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{aiData.ai_report?.what_is_happening}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>💡 {aiData.ai_report?.recommendation}</div>
                  </>
                ) : (
                  "Ожидание данных от сервера аналитики..."
                )}
              </div>

              <button className="detail-btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setDrawer('ai')}>
                {aiData ? `Статус: ${aiData.ai_report?.criticality}` : "Загрузка..."}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="img-feature-card" onClick={() => navigate('/transport')}>
          <img src={cityMini} alt="Traffic" />
          <div className="img-feature-overlay"><div className="img-feature-title">🚗 {t.nav.transport}</div></div>
        </div>
        <div className="img-feature-card" onClick={() => navigate('/ecology')}>
          <img src={cityNeon} alt="Air Quality" />
          <div className="img-feature-overlay"><div className="img-feature-title">🌿 {t.nav.ecology}</div></div>
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer === 'ai' ? ov.aiTitle : 'Analysis'}>
        <div style={{ padding: 20 }}>
          {drawer === 'ai' ? (
            <div>
              <h4 style={{ marginBottom: 10 }}>Рекомендация ИИ:</h4>
              <p>{aiData?.ai_report?.recommendation || "Данные скоро появятся"}</p>
            </div>
          ) : (
            "Подробная статистика систем города Алматы."
          )}
        </div>
      </Drawer>
    </div>
  );
}