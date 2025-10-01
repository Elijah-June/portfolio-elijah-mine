import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import useDebouncedCallback from '../hooks/useDebouncedCallback.js';

function pad(n) { return String(n).padStart(2, '0'); }
function ymToTitle(y, m) {
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [events, setEvents] = useState([]);
  const [activity, setActivity] = useState({}); // { 'YYYY-MM-DD': boolean }
  const { isAdmin } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => { api('/api/events').then(setEvents); }, []);
  useEffect(() => {
    api(`/api/activity?year=${year}&month=${month}`).then(rows => {
      const map = {};
      for (const r of rows) {
        // r.date may be an ISO string like '2025-09-30T16:00:00.000Z' or '2025-10-01'
        const key = typeof r.date === 'string'
          ? r.date.slice(0, 10)
          : new Date(r.date).toISOString().slice(0, 10);
        map[key] = r.active;
      }
      setActivity(map);
    }).catch(() => setActivity({}));
  }, [year, month]);

  const eventDays = useMemo(() => {
    const set = new Set();
    for (const e of events) {
      const d = new Date(e.start_at);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      set.add(key);
    }
    return set;
  }, [events]);

  function changeMonth(delta) {
    let y = year, m = month + delta;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setYear(y); setMonth(m);
  }

  function daysInMonth(y, m) {
    return new Date(y, m, 0).getDate();
  }

  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay(); // 0 Sun - 6 Sat
  const total = daysInMonth(year, month);
  const grid = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let d = 1; d <= total; d++) grid.push(d);

  const saveToggle = useDebouncedCallback(async (key, next) => {
    try {
      const row = await api(`/api/activity/${key}`, { method: 'PUT', data: { active: next } });
      const norm = typeof row.date === 'string'
        ? row.date.slice(0, 10)
        : new Date(row.date).toISOString().slice(0, 10);
      setActivity(a => ({ ...a, [norm]: row.active }));
    } catch (e) {
      // revert on error
      setActivity(a => ({ ...a, [key]: !next }));
    }
  }, 250);

  function toggleDay(d) {
    if (!isAdmin || !d) return;
    const key = `${year}-${pad(month)}-${pad(d)}`;
    // select the day in range controls so buttons can apply to it
    setRange({ start: key, end: key });
    const next = !activity[key];
    // optimistic update
    setActivity(a => ({ ...a, [key]: next }));
    saveToggle(key, next);
  }

  // Streak metrics within current month
  const streaks = useMemo(() => {
    const totalDays = daysInMonth(year, month);
    let current = 0, longest = 0;
    for (let d = 1; d <= totalDays; d++) {
      const key = `${year}-${pad(month)}-${pad(d)}`;
      if (activity[key]) {
        current += 1;
        if (current > longest) longest = current;
      } else {
        current = 0;
      }
    }
    // current streak computed from start of month; for accuracy from today backwards:
    let currentFromToday = 0;
    for (let d = now.getDate(); d >= 1; d--) {
      const key = `${year}-${pad(month)}-${pad(d)}`;
      if (activity[key]) currentFromToday += 1; else break;
    }
    return { longest, current: currentFromToday };
  }, [activity, year, month]);

  // Bulk range controls
  const [range, setRange] = useState({ start: '', end: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  async function applyRange(active) {
    setMsg(''); setErr('');
    if (!isAdmin) return;
    if (!range.start && !range.end) {
      setErr('Please select Start and End dates.');
      return;
    }
    try {
      setBusy(true);
      const start = range.start || range.end;
      const end = range.end || range.start; // allow single-day apply when one is missing
      await api('/api/activity/bulk', { method: 'POST', data: { start, end, active } });
      setMsg(active ? 'Days set to Active.' : 'Days set to Inactive.');
      // refetch month
      api(`/api/activity?year=${year}&month=${month}`).then(rows => {
        const map = {}; for (const r of rows) map[typeof r.date==='string'?r.date.slice(0,10):new Date(r.date).toISOString().slice(0,10)] = r.active; setActivity(map);
      });
    } catch (e) {
      setErr(e?.message || 'Failed to apply range');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(''), 1500);
    }
  }

  function exportCSV() {
    const url = `${API_BASE}/api/activity/export?year=${year}&month=${month}`;
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => changeMonth(-1)}>&larr; Prev</button>
        <h1 className="text-xl font-semibold">{ymToTitle(year, month)}</h1>
        <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => changeMonth(1)}>Next &rarr;</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid.map((d, i) => {
          if (!d) return <div key={i} className="h-20 rounded border border-white/5" />;
          const key = `${year}-${pad(month)}-${pad(d)}`;
          const isActive = !!activity[key];
          const hasEvent = eventDays.has(key);
          return (
            <button
              key={i}
              onClick={() => toggleDay(d)}
              className={
                `h-20 rounded border flex flex-col items-center justify-between p-2 transition-colors ` +
                (isActive ? 'bg-emerald-600/30 border-emerald-400/70 hover:bg-emerald-600/40' : 'bg-white/5 border-white/10 hover:bg-white/10')
              }
              title={isAdmin ? 'Toggle active' : undefined}
            >
              <div className={`self-end text-xs ${isActive ? 'text-emerald-200' : 'text-gray-300'}`}>{d}</div>
              <div className="h-2">
                {hasEvent && <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-400">
        <span className="inline-flex items-center gap-2 mr-4"><span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400/50" /> Active</span>
        <span className="inline-flex items-center gap-2 mr-4"><span className="w-3 h-3 rounded bg-white/10 border border-white/20" /> Inactive</span>
        <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Event</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
        <div className="px-3 py-2 rounded border border-white/10 bg-white/5">Current streak: <b>{streaks.current}</b></div>
        <div className="px-3 py-2 rounded border border-white/10 bg-white/5">Longest streak: <b>{streaks.longest}</b></div>
        <button className="ml-auto px-3 py-2 rounded bg-white/10 hover:bg-white/20" onClick={exportCSV}>Export CSV</button>
      </div>

      {isAdmin && (
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Start</label>
            <input type="date" className="border border-white/10 bg-white/5 text-white px-2 py-1 rounded" value={range.start} onChange={e => setRange(r => ({ ...r, start: e.target.value }))} />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">End</label>
            <input type="date" className="border border-white/10 bg-white/5 text-white px-2 py-1 rounded" value={range.end} onChange={e => setRange(r => ({ ...r, end: e.target.value }))} />
          </div>
          <button
            className={`px-3 py-2 rounded border hover:opacity-90 ${busy ? 'opacity-60 cursor-not-allowed' : ''} ${(!range.start||!range.end)?'opacity-60 cursor-not-allowed':''} bg-emerald-500/20 border-emerald-400/40`}
            onClick={() => applyRange(true)}
            disabled={busy || !range.start || !range.end}
          >
            {busy ? 'Working…' : 'Set Active'}
          </button>
          <button
            className={`px-3 py-2 rounded border hover:opacity-90 ${busy ? 'opacity-60 cursor-not-allowed' : ''} ${(!range.start||!range.end)?'opacity-60 cursor-not-allowed':''} bg-white/10 border-white/20`}
            onClick={() => applyRange(false)}
            disabled={busy || !range.start || !range.end}
          >
            {busy ? 'Working…' : 'Set Inactive'}
          </button>
          {(msg || err) && (
            <div className="w-full text-xs">
              {msg && <span className="text-emerald-300">{msg}</span>}
              {err && <span className="text-red-400">{err}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
