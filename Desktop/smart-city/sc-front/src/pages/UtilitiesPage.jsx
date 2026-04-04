import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import Drawer from '../components/Drawer';

const STATUS_COLORS = { critical: '#EF4444', warning: '#F59E0B', normal: '#10B981' };
const STATUS_BG     = { critical: 'rgba(239,68,68,.12)', warning: 'rgba(245,158,11,.12)', normal: 'rgba(16,185,129,.12)' };

// Realistic Almaty utility training data
const RESOURCES = [
  {
    id: 'water', name: 'Водоснабжение', icon: '💧', value: 98, status: 'normal', color: '#3B82F6',
    unit: 'м³/сут', consumption: '124 800', peak: '07:00–09:00', pressure: '3.2 бар',
    quality: 'Соответствует СанПиН', coverage: '99.2%',
    trend: [{ t:'00', v:82 },{ t:'04', v:71 },{ t:'08', v:98 },{ t:'12', v:89 },{ t:'16', v:84 },{ t:'20', v:91 },{ t:'23', v:78 }],
    details: [
      { label: 'Суточное потребление', value: '124 800 м³', ok: true },
      { label: 'Давление в сети', value: '3.2 бар', ok: true },
      { label: 'Качество воды', value: 'СанПиН: OK', ok: true },
      { label: 'Потери в сети', value: '8.4%', ok: true },
      { label: 'Насосных станций', value: '14 активных', ok: true },
      { label: 'Аварийных отключений', value: '1 сегодня', ok: false },
    ],
  },
  {
    id: 'electricity', name: 'Электроэнергия', icon: '⚡', value: 84, status: 'normal', color: '#F59E0B',
    unit: 'МВт·ч', consumption: '2 340', peak: '18:00–21:00', pressure: '220 В ±3%',
    quality: 'Стабильно, просадок нет', coverage: '100%',
    trend: [{ t:'00', v:55 },{ t:'04', v:42 },{ t:'08', v:78 },{ t:'12', v:84 },{ t:'16', v:91 },{ t:'20', v:97 },{ t:'23', v:72 }],
    details: [
      { label: 'Суточный расход', value: '2 340 МВт·ч', ok: true },
      { label: 'Напряжение', value: '220 В ±3%', ok: true },
      { label: 'Просадки напряжения', value: '0 сегодня', ok: true },
      { label: 'Резерв мощности', value: '16%', ok: false },
      { label: 'Трансформаторных подстанций', value: '48 онлайн', ok: true },
      { label: 'В ремонте', value: 'Подстанция 12', ok: false },
    ],
  },
  {
    id: 'gas', name: 'Газоснабжение', icon: '🔥', value: 91, status: 'normal', color: '#EF4444',
    unit: 'тыс.м³', consumption: '187.4', peak: '06:00–08:00', pressure: '0.4 МПа',
    quality: 'Давление в норме', coverage: '97.8%',
    trend: [{ t:'00', v:88 },{ t:'04', v:94 },{ t:'08', v:99 },{ t:'12', v:85 },{ t:'16', v:80 },{ t:'20', v:87 },{ t:'23', v:91 }],
    details: [
      { label: 'Суточный расход', value: '187.4 тыс. м³', ok: true },
      { label: 'Давление в сети', value: '0.4 МПа', ok: true },
      { label: 'Температура газа', value: '+8°C', ok: true },
      { label: 'Охват районов', value: '97.8%', ok: true },
      { label: 'Плановые работы', value: 'Блок 7, 07 апр', ok: true },
      { label: 'Газовых ГРП', value: '22 онлайн', ok: true },
    ],
  },
  {
    id: 'waste', name: 'Вывоз мусора', icon: '♻️', value: 76, status: 'warning', color: '#10B981',
    unit: 'тонн', consumption: '312', peak: '06:00–10:00', pressure: '—',
    quality: '24% не охвачено', coverage: '76%',
    trend: [{ t:'00', v:0 },{ t:'04', v:0 },{ t:'08', v:68 },{ t:'12', v:84 },{ t:'16', v:72 },{ t:'20', v:58 },{ t:'23', v:12 }],
    details: [
      { label: 'Вывезено сегодня', value: '312 т', ok: true },
      { label: 'Охват районов', value: '76%', ok: false },
      { label: 'Мусоровозов активно', value: '34 из 45', ok: false },
      { label: 'Переполненных баков', value: '18', ok: false },
      { label: 'Переработка', value: '28% от объёма', ok: true },
      { label: 'Следующий вывоз', value: 'Сегодня 18:00', ok: true },
    ],
  },
  {
    id: 'heating', name: 'Теплоснабжение', icon: '🌡️', value: 88, status: 'normal', color: '#8B5CF6',
    unit: 'Гкал', consumption: '4 120', peak: '05:00–08:00', pressure: '8.5 кгс/см²',
    quality: 'Теплоноситель +85°C', coverage: '98.1%',
    trend: [{ t:'00', v:91 },{ t:'04', v:94 },{ t:'08', v:97 },{ t:'12', v:85 },{ t:'16', v:80 },{ t:'20', v:88 },{ t:'23', v:90 }],
    details: [
      { label: 'Расход тепла', value: '4 120 Гкал', ok: true },
      { label: 'Температура теплоносителя', value: '+85°C', ok: true },
      { label: 'Давление в теплосети', value: '8.5 кгс/см²', ok: true },
      { label: 'Охват абонентов', value: '98.1%', ok: true },
      { label: 'ТЭЦ работают', value: '2 из 2', ok: true },
      { label: 'Тепловых узлов', value: '198 онлайн', ok: true },
    ],
  },
  {
    id: 'internet', name: 'Телеком/Интернет', icon: '📡', value: 99, status: 'normal', color: '#06B6D4',
    unit: 'Гбит/с', consumption: '184', peak: '20:00–23:00', pressure: '—',
    quality: 'Отказоустойчивость 99.9%', coverage: '99.4%',
    trend: [{ t:'00', v:62 },{ t:'04', v:48 },{ t:'08', v:84 },{ t:'12', v:91 },{ t:'16', v:88 },{ t:'20', v:99 },{ t:'23', v:84 }],
    details: [
      { label: 'Пиковая загрузка', value: '184 Гбит/с', ok: true },
      { label: 'Отказоустойчивость', value: '99.9%', ok: true },
      { label: 'Покрытие 4G/5G', value: '99.4%', ok: true },
      { label: 'Wi-Fi точек (город)', value: '1 240', ok: true },
      { label: 'Аварий сегодня', value: '0', ok: true },
      { label: 'Средняя скорость', value: '42 Мбит/с', ok: true },
    ],
  },
];

// Combined consumption chart (hourly training data)
const COMBINED_DATA = [
  { time: '00', water: 82, electricity: 55, gas: 88, heating: 91 },
  { time: '02', water: 74, electricity: 48, gas: 92, heating: 93 },
  { time: '04', water: 71, electricity: 42, gas: 94, heating: 94 },
  { time: '06', water: 88, electricity: 65, gas: 99, heating: 97 },
  { time: '08', water: 98, electricity: 78, gas: 95, heating: 95 },
  { time: '10', water: 91, electricity: 84, gas: 88, heating: 87 },
  { time: '12', water: 89, electricity: 84, gas: 85, heating: 85 },
  { time: '14', water: 85, electricity: 88, gas: 83, heating: 82 },
  { time: '16', water: 84, electricity: 91, gas: 80, heating: 80 },
  { time: '18', water: 91, electricity: 95, gas: 84, heating: 84 },
  { time: '20', water: 92, electricity: 97, gas: 87, heating: 88 },
  { time: '22', water: 84, electricity: 82, gas: 90, heating: 89 },
];

const MAINTENANCE = [
  { title: 'Водопровод №4 — плановая проверка', date: 'Сегодня, 14:00–17:00', district: 'Алмалинский', sev: 'warning', responsible: 'УКС №3' },
  { title: 'Подстанция 12 — модернизация ТП', date: '5 апр, 09:00–18:00', district: 'Бостандыкский', sev: 'normal', responsible: 'АлматыЭнерго' },
  { title: 'Газопровод блок 7 — замена трубы', date: '7 апр, 08:00–12:00', district: 'Ауэзовский', sev: 'normal', responsible: 'КазТрансГаз' },
  { title: 'Аудит системы вывоза отходов', date: '10 апр, 10:00–14:00', district: 'Все районы', sev: 'normal', responsible: 'Акимат' },
  { title: 'ТЭЦ-2 — ТО котлоагрегата №3', date: '12 апр, 06:00–20:00', district: 'Алатауский', sev: 'warning', responsible: 'АлматыТеплоЭнерго' },
];

const TooltipStyle = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 10, fontSize: 12, padding: '8px 12px',
  color: 'var(--text-1)', boxShadow: 'var(--shadow)',
};

export default function UtilitiesPage({ t }) {
  const ut = t.utilities;
  const [drawer, setDrawer] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [chartView, setChartView] = useState('combined');

  const handleResourceClick = (r) => {
    setActiveResource(r);
    setDrawer(true);
  };

  const overallScore = Math.round(RESOURCES.reduce((s, r) => s + r.value, 0) / RESOURCES.length);

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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            padding: '10px 20px', borderRadius: 14,
            background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
            color: '#fff', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{overallScore}%</div>
            <div style={{ fontSize: 11, opacity: .8 }}>Общий индекс</div>
          </div>
          <button className="detail-btn primary" onClick={() => { setActiveResource(null); setDrawer(true); }}>
            {t.detailBtn} →
          </button>
        </div>
      </div>

      {/* Stats row */}
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

      {/* Resource cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {RESOURCES.map((r) => (
          <div
            key={r.id}
            className="card interactive"
            style={{ padding: 18, cursor: 'pointer', borderTop: `3px solid ${r.color}` }}
            onClick={() => handleResourceClick(r)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.consumption} {r.unit}</div>
                </div>
              </div>
              <div className={`sev-dot ${r.status}`} />
            </div>

            {/* Value + bar */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: r.color }}>{r.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>%</div>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: r.status === 'normal' ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                {r.status === 'normal' ? '✓ Норма' : '⚠ Внимание'}
              </div>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r.value}%`, background: r.color, borderRadius: 6, transition: 'width .8s ease' }} />
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${r.color}18`, color: r.color, fontWeight: 600 }}>
                Пик: {r.peak}
              </span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--bg)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                {r.coverage} охват
              </span>
            </div>

            {/* Mini sparkline */}
            <div style={{ height: 40, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={r.trend} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`g_${r.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={r.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={r.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={r.color} strokeWidth={1.5} fill={`url(#g_${r.id})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Combined chart + Maintenance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Combined consumption chart */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Потребление ресурсов (24ч)</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['combined', 'bar'].map(v => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className="detail-btn"
                  style={chartView === v ? { background: '#8B5CF6', color: '#fff', borderColor: 'transparent' } : {}}
                >
                  {v === 'combined' ? 'Линии' : 'Столбцы'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'combined' ? (
                <AreaChart data={COMBINED_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-3)' }} tickFormatter={v => `${v}ч`} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--text-3)' }} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="water" name="Вода" stroke="#3B82F6" fill="#3B82F620" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="electricity" name="Электро" stroke="#F59E0B" fill="#F59E0B20" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="gas" name="Газ" stroke="#EF4444" fill="#EF444420" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="heating" name="Тепло" stroke="#8B5CF6" fill="#8B5CF620" strokeWidth={2} dot={false} />
                </AreaChart>
              ) : (
                <BarChart data={COMBINED_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-3)' }} tickFormatter={v => `${v}ч`} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--text-3)' }} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Bar dataKey="water" name="Вода" fill="#3B82F6" radius={[2,2,0,0]} />
                  <Bar dataKey="electricity" name="Электро" fill="#F59E0B" radius={[2,2,0,0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance schedule */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>График плановых работ</div>
          <div className="incident-list">
            {MAINTENANCE.map((m, i) => (
              <div key={i} className="incident-row">
                <div className={`sev-dot ${m.sev}`} />
                <div className="incident-info">
                  <div className="incident-title">{m.title}</div>
                  <div className="incident-sub">{m.date} · {m.district}</div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{m.responsible}</span>
              </div>
            ))}
          </div>
          {/* Budget mini */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'linear-gradient(135deg,rgba(139,92,246,.08),rgba(99,102,241,.08))', borderRadius: 12, border: '1px solid rgba(139,92,246,.2)' }}>
            <div style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
              Бюджет ЖКХ 2024
            </div>
            {[
              { label: 'Выделено',    value: '₸ 7.1 млрд', color: '#8B5CF6' },
              { label: 'Потрачено Q1', value: '₸ 2.3 млрд', color: '#3B82F6' },
              { label: 'Остаток',     value: '₸ 4.8 млрд', color: '#10B981' },
              { label: 'Выполнение',  value: '32.4%',       color: '#F59E0B' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource detail drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={activeResource ? `${activeResource.icon} ${activeResource.name}` : 'Детали ЖКХ'}>
        {activeResource ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header metric */}
            <div style={{ padding: '16px', background: `linear-gradient(135deg, ${activeResource.color}22, ${activeResource.color}11)`, borderRadius: 14, border: `1px solid ${activeResource.color}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 36 }}>{activeResource.icon}</span>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: activeResource.color }}>{activeResource.value}%</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{activeResource.name} · {activeResource.coverage} охват</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{activeResource.consumption}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{activeResource.unit}/сутки</div>
                </div>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,.2)', borderRadius: 8, marginTop: 12, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${activeResource.value}%`, background: activeResource.color, borderRadius: 8 }} />
              </div>
            </div>

            {/* Key facts */}
            {activeResource.details.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: `1px solid ${d.ok ? 'var(--border)' : 'rgba(239,68,68,.2)'}` }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{d.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: d.ok ? 'var(--text-1)' : '#EF4444' }}>{d.value}</span>
              </div>
            ))}

            {/* Chart */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Нагрузка за сутки</div>
              <div style={{ height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeResource.trend} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="drGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeResource.color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={activeResource.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--text-3)' }} />
                    <Tooltip contentStyle={TooltipStyle} />
                    <Area type="monotone" dataKey="v" stroke={activeResource.color} strokeWidth={2} fill="url(#drGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Info badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', borderRadius: 20, background: `${activeResource.color}18`, color: activeResource.color, fontSize: 12, fontWeight: 600 }}>
                Пик: {activeResource.peak}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 12 }}>
                {activeResource.quality}
              </span>
            </div>

            <button className="detail-btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              ⚙️ {t.actionBtn}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RESOURCES.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setActiveResource(r)}>
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.consumption} {r.unit}/сут</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{r.value}%</div>
                  <div className={`sev-dot ${r.status}`} style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
