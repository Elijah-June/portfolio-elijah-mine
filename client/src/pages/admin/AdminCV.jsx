import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminCV() {
  const toast = useToast();
  const [form, setForm] = useState({
    summary: '',
    education: { items: [] },
    experience: { items: [] },
    skills: { items: [] },
    certifications: { items: [] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const existing = await api('/api/cv');
        if (existing) {
          setForm({
            summary: existing.summary || '',
            education: existing.education || { items: [] },
            experience: existing.experience || { items: [] },
            skills: existing.skills || { items: [] },
            certifications: existing.certifications || { items: [] },
          });
        }
      } catch (e) {
        // ignore if not existing yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleJsonChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api('/api/cv', { method: 'PUT', data: form });
      setMessage('Saved successfully');
      toast.add('CV saved', { type: 'success' });
      setForm({
        summary: res.summary || '',
        education: res.education || { items: [] },
        experience: res.experience || { items: [] },
        skills: res.skills || { items: [] },
        certifications: res.certifications || { items: [] },
      });
    } catch (e) {
      setMessage(e?.message || 'Failed to save');
      toast.add(e?.message || 'Failed to save CV', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-300">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit Curriculum Vitae</h1>
      {message && <div className="text-sm text-gray-300">{message}</div>}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Summary</label>
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            className="w-full p-3 rounded bg-black/40 border border-white/10 text-gray-100 min-h-[120px]"
            placeholder="A short professional summary"
          />
        </div>

        <JsonEditor
          label="Education (JSON)"
          value={form.education}
          onChange={(v) => handleJsonChange('education', v)}
          example={{ items: [{ degree: 'BSc', field: 'CS', institution: 'University', period: '2018-2022' }] }}
        />

        <JsonEditor
          label="Experience (JSON)"
          value={form.experience}
          onChange={(v) => handleJsonChange('experience', v)}
          example={{ items: [{ role: 'Software Engineer', company: 'Acme', period: '2022-Present', details: ['Built X', 'Shipped Y'] }] }}
        />

        <JsonEditor
          label="Skills (JSON)"
          value={form.skills}
          onChange={(v) => handleJsonChange('skills', v)}
          example={{ items: ['JavaScript', 'React', 'Node.js'] }}
        />

        <JsonEditor
          label="Certifications (JSON)"
          value={form.certifications}
          onChange={(v) => handleJsonChange('certifications', v)}
          example={{ items: [{ name: 'AWS CCP', issuer: 'Amazon', date: '2024' }] }}
        />

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save CV'}
        </button>
      </form>
    </div>
  );
}

function JsonEditor({ label, value, onChange, example }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState('');

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  const onTextChange = (e) => {
    const t = e.target.value;
    setText(t);
    try {
      const parsed = JSON.parse(t || '{}');
      setError('');
      onChange(parsed);
    } catch (err) {
      setError('Invalid JSON');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-gray-300 mb-2">{label}</label>
        <button
          type="button"
          onClick={() => setText(JSON.stringify(example, null, 2))}
          className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 text-gray-200"
        >
          Fill Example
        </button>
      </div>
      <textarea
        value={text}
        onChange={onTextChange}
        className="w-full p-3 rounded bg-black/40 border border-white/10 text-gray-100 font-mono min-h-[180px]"
      />
      {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
    </div>
  );
}
