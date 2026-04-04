import { useState, useRef, useEffect } from 'react';

const WELCOME = {
  id: 0,
  from: 'bot',
  text: 'Привет! Я советник Smart City Алматы 🏙️\nСпросите меня о воздухе, транспорте, безопасности или ЖКХ.',
};

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    fetch('http://127.0.0.1:8001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: data.reply }]);
      })
      .catch(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          from: 'bot',
          text: 'Сервер аналитики недоступен. Попробуйте позже.',
        }]);
      })
      .finally(() => setLoading(false));
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="chat-avatar">🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>AI Советник</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Smart City Алматы</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble ${msg.from}`}>
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot">
                <span className="chat-typing"><span /><span /><span /></span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Напишите вопрос..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              disabled={loading}
            />
            <button className="chat-send-btn" onClick={send} disabled={!input.trim() || loading}>
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        className={`chat-fab ${open ? 'active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="AI Советник"
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  );
}
