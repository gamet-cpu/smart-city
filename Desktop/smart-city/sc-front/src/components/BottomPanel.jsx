import { useState } from 'react';
import { budgetData } from '../data/mockData';

export default function BottomPanel({ t }) {
  const b = t.bottom;
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);

  const runSim = () => {
    if (simRunning) return;
    setSimDone(false);
    setSimRunning(true);
    setTimeout(() => {
      setSimRunning(false);
      setSimDone(true);
    }, 1600);
  };

  const cats = b.budgetCategories;

  return (
    <div className="bottom-panel">
      {/* Budget */}
      <div className="card bottom-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>{b.budget}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>₸ 7.1B total</div>
        </div>

        <div className="budget-bars">
          {cats.map((c, i) => (
            <div key={i} className="budget-row">
              <div className="budget-label" style={{ color: c.color }}>{c.name}</div>
              <div className="budget-bar-track">
                <div
                  className="budget-bar-fill"
                  style={{ width: `${c.value}%`, background: c.color }}
                />
              </div>
              <div className="budget-pct">{c.value}%</div>
            </div>
          ))}
        </div>

        {/* Mini donut-style legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}>
          {cats.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{budgetData[i]?.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario */}
      <div className="card bottom-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>{b.whatIf}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{b.scenario}</div>
        </div>

        <div className="scenario-block">
          <div className="scenario-label">{b.scenarioLabel}</div>
          <div className={`scenario-result ${simDone ? 'visible' : ''}`}>
            {b.scenarioResult}
          </div>
          {!simDone && !simRunning && (
            <button className="sim-btn" onClick={runSim}>
              ▶ {b.simulate}
            </button>
          )}
          {simRunning && (
            <button className="sim-btn" disabled>
              ⏳ ...
            </button>
          )}
          {simDone && (
            <button className="sim-btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }} onClick={() => setSimDone(false)}>
              ↺ Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
