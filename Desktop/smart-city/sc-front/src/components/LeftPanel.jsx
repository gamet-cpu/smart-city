import { useState } from 'react';

const RECS = [
  { icon: '🚗', key: 'rec1' },
  { icon: '🌿', key: 'rec2' },
  { icon: '🛡️', key: 'rec3' },
];

export default function LeftPanel({ t }) {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState(null);

  const lp = t.leftPanel;

  const handleSolve = () => {
    if (!input.trim()) return;
    setThinking(true);
    setResponse(null);
    setTimeout(() => {
      setThinking(false);
      setResponse(lp.rec1);
    }, 1400);
  };

  const handleOptimize = () => {
    setThinking(true);
    setResponse(null);
    setTimeout(() => {
      setThinking(false);
      setResponse(lp.rec2);
    }, 1000);
  };

  return (
    <div className="left-panel">
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <div>
              <div className="panel-title">{lp.title}</div>
              <div className="panel-subtitle">{lp.subtitle}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px 6px' }}>
          <div className="card-title">{lp.recommendation}</div>
        </div>

        <div className="rec-block">
          {RECS.map(r => (
            <div key={r.key} className="rec-item">
              <span className="rec-icon">{r.icon}</span>
              <span className="rec-text">{lp[r.key]}</span>
            </div>
          ))}

          {thinking && (
            <div className="rec-item" style={{ opacity: 0.7 }}>
              <span className="rec-icon">⏳</span>
              <span className="rec-text" style={{ color: 'var(--accent-blue)' }}>{lp.thinking}</span>
            </div>
          )}

          {response && !thinking && (
            <div className="rec-item" style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' }}>
              <span className="rec-icon">💡</span>
              <span className="rec-text" style={{ color: 'var(--text-primary)' }}>{response}</span>
            </div>
          )}
        </div>

        <div className="ai-input-block">
          <textarea
            className="ai-textarea"
            placeholder={lp.placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSolve(); } }}
          />
          <button className="ai-btn primary" onClick={handleSolve} disabled={thinking}>
            ⚡ {lp.solve}
          </button>
          <button className="ai-btn secondary" onClick={handleOptimize} disabled={thinking}>
            ⚙️ {lp.optimize}
          </button>
        </div>
      </div>
    </div>
  );
}
