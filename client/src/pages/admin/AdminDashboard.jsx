import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal.jsx';
import { api } from '../../api/client.js';

export default function AdminDashboard() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content_md: '', published: true });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function createPost(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api('/api/blogs', { method: 'POST', data: form });
      setMsg('Blog post created');
      setForm({ title: '', content_md: '', published: true });
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Error');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/admin/projects" className="p-4 border rounded bg-white hover:bg-gray-50">
          Manage Projects
        </Link>
        <Link to="/admin/profile" className="p-4 border rounded bg-white hover:bg-gray-50">
          Edit Profile
        </Link>
        <button className="p-4 border rounded bg-white hover:bg-gray-50 text-left" onClick={() => setOpen(true)}>
          New Blog Post
        </button>
      </div>
      {msg && <div className="text-green-700">{msg}</div>}

      <Modal open={open} onClose={() => setOpen(false)} title="New Blog Post">
        <form className="space-y-3" onSubmit={createPost}>
          <input className="w-full border px-3 py-2 rounded" placeholder="Title"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <textarea className="w-full border px-3 py-2 rounded h-48 font-mono text-sm" placeholder="Markdown content"
            value={form.content_md} onChange={e => setForm(f => ({ ...f, content_md: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2" onClick={() => setOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
