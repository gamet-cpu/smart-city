import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { trendData } from '../data/mockData';

const COLORS = {
  transport: '#3b82f6',
  ecology:   '#22c55e',
  safety:    '#f59e0b',
  utilities: '#a78bfa',
};

const customTooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 11,
  padding: '6px 10px',
  color: 'var(--text-primary)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={customTooltipStyle}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 11 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function CenterDashboard({ t }) {
  const c = t.center;
  const kpis = t.kpi;

  const catData = [
    { name: kpis.transport, value: 5, fill: COLORS.transport },
    { name: kpis.ecology,   value: 2, fill: COLORS.ecology },
    { name: kpis.safety,    value: 1, fill: COLORS.safety },
    { name: kpis.utilities, value: 3, fill: COLORS.utilities },
  ];

  return (
    <div className="center-panel">
      {/* Left: 2 charts stacked */}
      <div className="center-charts" style={{ gridColumn: 1, gridRow: '1 / 3' }}>
        {/* Line Chart */}
        <div className="card chart-card">
          <div className="card-title">{c.trends}</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 2, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                {Object.entries(COLORS).map(([key, color]) => (
                  <Line
                    key={key} type="monotone" dataKey={key}
                    name={kpis[key]} stroke={color} strokeWidth={2}
                    dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card chart-card">
          <div className="card-title">{c.distribution}</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} margin={{ top: 2, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {catData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right col: news + ai summary + map */}
      <div className="center-right-col">
        {/* News feed */}
        <div className="card news-card">
          <div className="card-title">{c.news}</div>
          <div className="news-list">
            {c.newsItems.map((item, i) => (
              <div key={i} className="news-item">
                <span className={`news-tag ${item.level}`}>{item.tag}</span>
                <div className="news-body">
                  <div className="news-text">{item.text}</div>
                  <div className="news-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="ai-summary-card">
          <div className="ai-badge">✦ {c.aiSummary}</div>
          <div className="ai-summary-text">{c.aiAnalysis}</div>
        </div>

        {/* Map placeholder */}
        <div className="card map-card">
          <div className="map-icon">🗺️</div>
          <div className="map-title">{c.mapPlaceholder}</div>
          <div className="map-sub">{c.mapSub}</div>
        </div>
      </div>
    </div>
  );
}
