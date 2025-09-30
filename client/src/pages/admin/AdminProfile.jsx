import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

export default function AdminProfile() {
  const [form, setForm] = useState({ display_name: '', title: '', bio: '', avatar_url: '', social_links: '{}', education: '', expertise: '', profile_summary: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/api/profile').then(p => {
      setForm({
        display_name: p?.display_name || '',
        title: p?.title || '',
        bio: p?.bio || '',
        avatar_url: p?.avatar_url || '',
        social_links: JSON.stringify(p?.social_links || {}, null, 2),
        education: p?.education || '',
        expertise: p?.expertise || '',
        profile_summary: p?.profile_summary || '',
      });
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('');
    let social = {};
    try { social = JSON.parse(form.social_links || '{}'); } catch (e) { alert('Invalid social_links JSON'); return; }
    const payload = { ...form, social_links: social };
    const p = await api('/api/profile', { method: 'PUT', data: payload });
    setMsg('Saved!');
    setForm(f => ({ ...f, social_links: JSON.stringify(p.social_links || {}, null, 2) }));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <form className="grid md:grid-cols-2 gap-3 border border-white/10 rounded p-4 bg-white/5" onSubmit={save}>
        <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Display name" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
        <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded md:col-span-2" placeholder="Avatar URL" value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} />
        <textarea className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded md:col-span-2" placeholder="Bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />

        <textarea className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded md:col-span-2" placeholder="Profile summary" value={form.profile_summary} onChange={e => setForm(f => ({ ...f, profile_summary: e.target.value }))} />
        <textarea className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Education" value={form.education} onChange={e => setForm(f => ({ ...f, education: e.target.value }))} />
        <textarea className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Expertise" value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} />

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Social links (JSON)</label>
          <textarea className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded w-full font-mono text-sm h-40" value={form.social_links} onChange={e => setForm(f => ({ ...f, social_links: e.target.value }))} />
        </div>
        <button className="px-4 py-2 bg-white text-black rounded md:col-span-2">Save</button>
      </form>
      {msg && <div className="text-green-400">{msg}</div>}
    </div>
  );
}
