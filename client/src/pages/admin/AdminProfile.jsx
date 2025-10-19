import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminProfile() {
  const [form, setForm] = useState({
    display_name: '',
    title: '',
    bio: '',
    avatar_url: '',
    education: '',
    expertise: '',
    profile_summary: '',
  });
  const [social, setSocial] = useState({ website: '', github: '', linkedin: '', twitter: '', cv: '' });
  const [msg, setMsg] = useState('');
  const toast = useToast();

  useEffect(() => {
    api('/api/profile').then(p => {
      setForm({
        display_name: p?.display_name || '',
        title: p?.title || '',
        bio: p?.bio || '',
        avatar_url: p?.avatar_url || '',
        education: p?.education || '',
        expertise: p?.expertise || '',
        profile_summary: p?.profile_summary || '',
      });
      const sl = p?.social_links || {};
      setSocial({
        website: sl.website || '',
        github: sl.github || '',
        linkedin: sl.linkedin || '',
        twitter: sl.twitter || '',
        cv: sl.cv || sl.cv_url || '',
      });
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('');
    const social_links = Object.fromEntries(
      Object.entries(social).filter(([, v]) => (v ?? '').trim() !== '')
    );
    const payload = { ...form, social_links };
    try {
      const p = await api('/api/profile', { method: 'PUT', data: payload });
      setMsg('Saved!');
      toast.add('Profile saved', { type: 'success' });
      const sl = p?.social_links || {};
      setSocial({
        website: sl.website || '',
        github: sl.github || '',
        linkedin: sl.linkedin || '',
        twitter: sl.twitter || '',
        cv: sl.cv || sl.cv_url || '',
      });
    } catch (err) {
      toast.add(err?.message || 'Failed to save profile', { type: 'error' });
    }
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
        <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
          <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Website URL" value={social.website} onChange={e => setSocial(s => ({ ...s, website: e.target.value }))} />
          <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="GitHub URL" value={social.github} onChange={e => setSocial(s => ({ ...s, github: e.target.value }))} />
          <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="LinkedIn URL" value={social.linkedin} onChange={e => setSocial(s => ({ ...s, linkedin: e.target.value }))} />
          <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Twitter URL" value={social.twitter} onChange={e => setSocial(s => ({ ...s, twitter: e.target.value }))} />
          <input className="border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded md:col-span-2" placeholder="CV URL" value={social.cv} onChange={e => setSocial(s => ({ ...s, cv: e.target.value }))} />
        </div>
        <button className="px-4 py-2 bg-white text-black rounded md:col-span-2">Save</button>
      </form>
      {msg && <div className="text-green-400">{msg}</div>}
    </div>
  );
}
