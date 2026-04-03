export default function RightPanel({ t }) {
  const rp = t.rightPanel;

  return (
    <div className="right-panel">
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <div>
              <div className="panel-title">{rp.title}</div>
              <div className="panel-subtitle">{rp.subtitle}</div>
            </div>
          </div>
        </div>

        <div className="problems-list">
          {rp.problems.map((p, i) => (
            <div key={i} className={`problem-card ${p.severity}`}>
              <div className="problem-header">
                <span className="problem-zone">{p.zone}</span>
                <span className={`priority-badge ${p.priority}`}>
                  {rp.priority[p.priority]}
                </span>
              </div>

              <div className="problem-category">{p.category}</div>

              <div className="problem-issue">{p.issue}</div>

              <div className="problem-action">
                <span>→</span>
                <span>{p.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
