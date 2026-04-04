import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://127.0.0.1:8001';

const STATUS_COLORS   = { pending: '#6366F1', in_progress: '#F59E0B', completed: '#10B981', converted: '#06B6D4' };
const STATUS_BG       = { pending: 'rgba(99,102,241,.12)', in_progress: 'rgba(245,158,11,.12)', completed: 'rgba(16,185,129,.12)', converted: 'rgba(6,182,212,.12)' };
const PRIORITY_COLORS = { critical: '#EF4444', high: '#F59E0B', medium: '#6366F1', low: '#10B981' };
const PRIORITY_BG     = { critical: 'rgba(239,68,68,.12)', high: 'rgba(245,158,11,.12)', medium: 'rgba(99,102,241,.12)', low: 'rgba(16,185,129,.12)' };

const CAT_ICONS = { roads: '🛣️', ecology: '🌿', safety: '🛡️', utilities: '⚡', transport: '🚗', parks: '🌳', other: '📋' };
const CAT_LABELS = { roads: 'Дороги', ecology: 'Экология', safety: 'Безопасность', utilities: 'ЖКХ', transport: 'Транспорт', parks: 'Парки', other: 'Прочее' };
const STATUS_LABELS = { pending: 'Ожидает', in_progress: 'В работе', completed: 'Выполнено', converted: 'Принято' };
const PRIORITY_LABELS = { critical: 'Критично', high: 'Высокий', medium: 'Средний', low: 'Низкий' };

const DISTRICTS = ['Алатауский', 'Алмалинский', 'Ауэзовский', 'Бостандыкский', 'Жетісуский', 'Медеуский', 'Наурызбайский', 'Түрксіб'];

export default function AkimatPage({ t }) {
  const [tab, setTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [akims, setAkims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [assignResult, setAssignResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'roads', district: 'Медеуский', author: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [t, c, a] = await Promise.all([
        fetch(`${API}/api/tasks`).then(r => r.json()),
        fetch(`${API}/api/citizens`).then(r => r.json()),
        fetch(`${API}/api/akims`).then(r => r.json()),
      ]);
      setTasks(t);
      setCitizens(c);
      setAkims(a);
    } catch {
      showToast('Сервер недоступен. Запустите backend.', false);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const getAkim = (id) => akims.find(a => a.id === id);

  // AI assign
  const handleAiAssign = async () => {
    const unassigned = tasks.filter(t => !t.akim_id && t.status !== 'completed').map(t => t.id);
    if (!unassigned.length) { showToast('Нет неназначенных задач', false); return; }
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/api/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: unassigned }),
      }).then(r => r.json());
      setAssignResult(res.assignments);
      await loadAll();
      showToast(`ИИ распределил ${res.assignments.length} задач!`);
    } catch {
      showToast('Ошибка распределения', false);
    }
    setAiLoading(false);
  };

  // Vote
  const handleVote = async (id) => {
    try {
      const updated = await fetch(`${API}/api/citizens/${id}/vote`, { method: 'POST' }).then(r => r.json());
      setCitizens(prev => prev.map(c => c.id === id ? updated : c));
      showToast('Голос принят!');
    } catch { showToast('Ошибка', false); }
  };

  // Convert to task
  const handleConvert = async (id) => {
    try {
      const res = await fetch(`${API}/api/citizens/${id}/to-task`, { method: 'POST' }).then(r => r.json());
      await loadAll();
      showToast(`Обращение #${id} конвертировано в задачу!`);
    } catch { showToast('Ошибка конвертации', false); }
  };

  // Submit citizen request
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.author.trim()) { showToast('Заполните название и имя', false); return; }
    try {
      const res = await fetch(`${API}/api/citizens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then(r => r.json());
      setCitizens(prev => [res, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'roads', district: 'Медеуский', author: '' });
      showToast('Обращение отправлено!');
    } catch { showToast('Ошибка отправки', false); }
  };

  // Update task status
  const handleStatusUpdate = async (taskId, status) => {
    try {
      const updated = await fetch(`${API}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then(r => r.json());
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      showToast('Статус обновлён');
    } catch { showToast('Ошибка', false); }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t =>
    (filterStatus === 'all' || t.status === filterStatus) &&
    (filterCat === 'all' || t.category === filterCat)
  );

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const citizenStats = {
    total: citizens.length,
    pending: citizens.filter(c => c.status === 'pending').length,
    critical: citizens.filter(c => c.priority === 'critical').length,
    topVotes: citizens.reduce((m, c) => Math.max(m, c.votes), 0),
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 999,
          padding: '12px 20px', borderRadius: 12,
          background: toast.ok ? '#10B981' : '#EF4444',
          color: '#fff', fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,.3)',
          animation: 'fadeIn .3s ease',
        }}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">🏛️ Задания Акимата</div>
          <div className="page-subtitle">Управление городскими задачами и обращениями граждан</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="detail-btn primary"
            onClick={handleAiAssign}
            disabled={aiLoading}
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', color: '#fff' }}
          >
            {aiLoading ? '⏳ Gemini думает...' : '🤖 AI Распределить'}
          </button>
          <button className="detail-btn" onClick={loadAll} disabled={loading}>
            {loading ? '⏳' : '↻'} Обновить
          </button>
        </div>
      </div>

      {/* AI Assignment result */}
      {assignResult && (
        <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(99,102,241,.08)', borderRadius: 14, border: '1px solid rgba(99,102,241,.25)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', marginBottom: 8 }}>
            🤖 Gemini распределил {assignResult.length} задач:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {assignResult.map((a, i) => {
              const akim = getAkim(a.akim_id);
              return (
                <div key={i} style={{ padding: '6px 12px', background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: '#6366F1', fontWeight: 700 }}>Задача #{a.task_id}</span>
                  {' → '}
                  <span style={{ fontWeight: 600 }}>{akim?.name}</span>
                  {a.reason && <span style={{ color: 'var(--text-3)' }}> · {a.reason}</span>}
                </div>
              );
            })}
          </div>
          <button onClick={() => setAssignResult(null)} style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>Закрыть</button>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Всего задач',    value: stats.total,       color: '#6366F1', icon: '📋' },
          { label: 'В ожидании',     value: stats.pending,     color: '#F59E0B', icon: '⏳' },
          { label: 'В работе',       value: stats.inProgress,  color: '#3B82F6', icon: '⚙️' },
          { label: 'Выполнено',      value: stats.completed,   color: '#10B981', icon: '✅' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px', borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span>{s.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--card)', padding: 4, borderRadius: 14, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { id: 'tasks',   label: `📋 Задания (${stats.total})` },
          { id: 'citizens',label: `👥 Обращения (${citizenStats.total})` },
          { id: 'akims',   label: `🏛️ Акимы (${akims.length})` },
        ].map(tab_ => (
          <button
            key={tab_.id}
            onClick={() => setTab(tab_.id)}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === tab_.id ? 'var(--grad-primary)' : 'transparent',
              color: tab === tab_.id ? '#fff' : 'var(--text-2)',
              transition: 'all .18s',
              boxShadow: tab === tab_.id ? '0 2px 8px rgba(99,102,241,.35)' : 'none',
            }}
          >
            {tab_.label}
          </button>
        ))}
      </div>

      {/* ── TASKS TAB ─────────────────────────────────────── */}
      {tab === 'tasks' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>Статус:</span>
            {['all', 'pending', 'in_progress', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="detail-btn"
                style={filterStatus === s ? { background: '#6366F1', color: '#fff', borderColor: 'transparent' } : {}}
              >
                {s === 'all' ? 'Все' : STATUS_LABELS[s]}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginLeft: 8 }}>Тип:</span>
            {['all', 'roads', 'ecology', 'safety', 'utilities', 'transport'].map(c => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className="detail-btn"
                style={filterCat === c ? { background: '#6366F1', color: '#fff', borderColor: 'transparent' } : {}}
              >
                {c === 'all' ? 'Все' : `${CAT_ICONS[c]} ${CAT_LABELS[c]}`}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTasks.length === 0 && (
              <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Задач не найдено</div>
            )}
            {filteredTasks.map(task => {
              const akim = getAkim(task.akim_id);
              return (
                <div key={task.id} className="card" style={{ padding: '16px 20px', borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#6366F1'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Icon */}
                    <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{CAT_ICONS[task.category] || '📋'}</div>

                    {/* Main info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{task.title}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: PRIORITY_BG[task.priority], color: PRIORITY_COLORS[task.priority], fontWeight: 600 }}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: STATUS_BG[task.status], color: STATUS_COLORS[task.status], fontWeight: 600 }}>
                          {STATUS_LABELS[task.status]}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
                        📍 {task.district} · 📅 до {task.deadline} · #{task.id}
                      </div>

                      {/* Progress bar */}
                      {task.progress !== undefined && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Прогресс</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[task.status] }}>{task.progress}%</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${task.progress}%`, background: STATUS_COLORS[task.status], borderRadius: 6, transition: 'width .6s' }} />
                          </div>
                        </div>
                      )}

                      {/* Assigned akim */}
                      {akim ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: `${akim.color}15`, borderRadius: 20, border: `1px solid ${akim.color}30` }}>
                          <div style={{ width: 22, height: 22, borderRadius: 11, background: akim.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>{akim.avatar}</div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: akim.color }}>{akim.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {akim.district}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>⚠ Не назначен</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      {task.status === 'pending' && (
                        <button className="detail-btn" style={{ fontSize: 11, borderColor: '#F59E0B', color: '#F59E0B' }} onClick={() => handleStatusUpdate(task.id, 'in_progress')}>
                          ▶ Начать
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button className="detail-btn" style={{ fontSize: 11, borderColor: '#10B981', color: '#10B981' }} onClick={() => handleStatusUpdate(task.id, 'completed')}>
                          ✓ Завершить
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>✅ Готово</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CITIZENS TAB ──────────────────────────────────── */}
      {tab === 'citizens' && (
        <div>
          {/* Header + form toggle */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Всего', value: citizenStats.total, color: '#6366F1' },
                { label: 'Ожидает', value: citizenStats.pending, color: '#F59E0B' },
                { label: 'Критично', value: citizenStats.critical, color: '#EF4444' },
                { label: 'Макс. голосов', value: citizenStats.topVotes, color: '#10B981' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '8px 14px', background: 'var(--card)', borderRadius: 10, border: `1px solid ${s.color}30` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button
              className="detail-btn primary"
              onClick={() => setShowForm(v => !v)}
              style={{ marginLeft: 'auto', background: showForm ? 'var(--card)' : undefined, color: showForm ? 'var(--text-2)' : undefined }}
            >
              {showForm ? '✕ Отмена' : '+ Подать обращение'}
            </button>
          </div>

          {/* Submit form */}
          {showForm && (
            <div className="card" style={{ padding: 20, marginBottom: 16, border: '1px solid rgba(99,102,241,.3)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📝 Новое обращение</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input
                  placeholder="Краткое название проблемы *"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13 }}
                />
                <input
                  placeholder="Ваше имя *"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13 }}
                />
              </div>
              <textarea
                placeholder="Подробное описание проблемы..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13, resize: 'vertical', marginBottom: 10 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13 }}>
                  {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{CAT_ICONS[k]} {v}</option>)}
                </select>
                <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13 }}>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button className="detail-btn primary" onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
                📤 Отправить обращение
              </button>
            </div>
          )}

          {/* Citizens list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {citizens.map(req => (
              <div key={req.id} className="card" style={{ padding: '16px 20px', borderLeft: `3px solid ${PRIORITY_COLORS[req.priority] || '#6366F1'}` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>{CAT_ICONS[req.category] || '📋'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{req.title}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: PRIORITY_BG[req.priority], color: PRIORITY_COLORS[req.priority], fontWeight: 600 }}>
                        {PRIORITY_LABELS[req.priority]}
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: STATUS_BG[req.status] || STATUS_BG.pending, color: STATUS_COLORS[req.status] || STATUS_COLORS.pending, fontWeight: 600 }}>
                        {STATUS_LABELS[req.status] || req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>{req.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      👤 {req.author} · 📍 {req.district} · 🕐 {req.timestamp}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    {/* Vote button */}
                    <button
                      onClick={() => handleVote(req.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 20,
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13,
                        fontWeight: 700, color: req.votes > 50 ? '#EF4444' : 'var(--text-2)',
                        transition: 'all .18s',
                      }}
                    >
                      👍 {req.votes}
                    </button>
                    {req.status !== 'converted' && (
                      <button
                        onClick={() => handleConvert(req.id)}
                        className="detail-btn"
                        style={{ fontSize: 11, borderColor: '#6366F1', color: '#6366F1' }}
                      >
                        → В задачу
                      </button>
                    )}
                    {req.status === 'converted' && (
                      <span style={{ fontSize: 11, color: '#06B6D4', fontWeight: 600 }}>✓ Принято</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AKIMS TAB ─────────────────────────────────────── */}
      {tab === 'akims' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {akims.map(akim => {
            const myTasks = tasks.filter(t => t.akim_id === akim.id);
            const done = myTasks.filter(t => t.status === 'completed').length;
            const inProgress = myTasks.filter(t => t.status === 'in_progress').length;
            const pending = myTasks.filter(t => t.status === 'pending').length;
            const load = myTasks.filter(t => t.status !== 'completed').length;

            return (
              <div key={akim.id} className="card" style={{ padding: '20px', borderTop: `3px solid ${akim.color}` }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 22,
                    background: `linear-gradient(135deg, ${akim.color}, ${akim.color}aa)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#fff',
                    boxShadow: `0 4px 12px ${akim.color}44`,
                    flexShrink: 0,
                  }}>
                    {akim.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{akim.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      📍 {akim.district} · {akim.specialty.map(s => CAT_LABELS[s] || s).join(', ')}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: load > 3 ? '#EF4444' : akim.color }}>{load}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>активных</div>
                  </div>
                </div>

                {/* Task counters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Ожидает', value: pending, color: '#6366F1' },
                    { label: 'В работе', value: inProgress, color: '#F59E0B' },
                    { label: 'Сделано', value: done, color: '#10B981' },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg)', borderRadius: 10 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Load bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Загрузка</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: load > 3 ? '#EF4444' : akim.color }}>
                      {Math.min(load * 20, 100)}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(load * 20, 100)}%`, background: load > 3 ? '#EF4444' : akim.color, borderRadius: 6 }} />
                  </div>
                </div>

                {/* Active tasks preview */}
                {myTasks.filter(t => t.status !== 'completed').slice(0, 2).map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg)', borderRadius: 8, marginBottom: 4, fontSize: 12 }}>
                    <span>{CAT_ICONS[task.category]}</span>
                    <span style={{ flex: 1, color: 'var(--text-2)' }}>{task.title}</span>
                    <span style={{ color: STATUS_COLORS[task.status], fontWeight: 600, fontSize: 10 }}>{STATUS_LABELS[task.status]}</span>
                  </div>
                ))}
                {myTasks.filter(t => t.status !== 'completed').length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: 8 }}>Нет активных задач</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
