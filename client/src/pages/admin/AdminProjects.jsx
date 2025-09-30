import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', tags: '', repo_url: '', demo_url: '', image_url: '' });
  const [error, setError] = useState('');

  async function load() {
    const data = await api('/api/projects');
    setProjects(data);
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      const p = await api('/api/projects', { method: 'POST', data: payload });
      setProjects(prev => [p, ...prev]);
      setForm({ title: '', description: '', tags: '', repo_url: '', demo_url: '', image_url: '' });
    } catch (err) {
      setError(err.message || 'Error');
    }
  }

  async function remove(id) {
    if (!confirm('Delete project?')) return;
    await api(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Projects</h1>
      <form className="grid md:grid-cols-2 gap-3 bg-white border rounded p-4" onSubmit={create}>
        <input className="border px-3 py-2 rounded" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <input className="border px-3 py-2 rounded" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
        <input className="border px-3 py-2 rounded" placeholder="Repo URL" value={form.repo_url} onChange={e => setForm(f => ({ ...f, repo_url: e.target.value }))} />
        <input className="border px-3 py-2 rounded" placeholder="Demo URL" value={form.demo_url} onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))} />
        <input className="border px-3 py-2 rounded md:col-span-2" placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        <textarea className="border px-3 py-2 rounded md:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}
        <button className="px-4 py-2 bg-gray-900 text-white rounded md:col-span-2">Create Project</button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map(p => (
          <div key={p.id} className="p-4 border rounded bg-white">
            <div className="flex items-start gap-3">
              {p.image_url && <img src={p.image_url} className="w-24 h-24 object-cover rounded" alt="" />}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.title}</h3>
                  <button className="text-red-600" onClick={() => remove(p.id)}>Delete</button>
                </div>
                {p.description && <p className="text-sm text-gray-700 mt-1">{p.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
