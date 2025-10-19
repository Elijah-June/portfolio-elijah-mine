import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminCV() {
  const toast = useToast();
  const [form, setForm] = useState({ summary: '' });
  const [educationText, setEducationText] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [certsText, setCertsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const existing = await api('/api/cv');
        if (existing) {
          setForm({ summary: existing.summary || '' });
          const eduItems = (existing.education?.items || []).map(i => `${i.degree || ''} | ${i.field || ''} | ${i.institution || ''} | ${i.period || ''}`.trim());
          setEducationText(eduItems.join('\n'));
          const expItems = (existing.experience?.items || []).map(i => {
            const details = Array.isArray(i.details) ? i.details.join('; ') : '';
            return `${i.role || ''} | ${i.company || ''} | ${i.period || ''} | ${details}`.trim();
          });
          setExperienceText(expItems.join('\n'));
          const skillItems = (existing.skills?.items || []).join(', ');
          setSkillsText(skillItems);
          const certItems = (existing.certifications?.items || []).map(i => `${i.name || ''} | ${i.issuer || ''} | ${i.date || ''}`.trim());
          setCertsText(certItems.join('\n'));
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const education = {
        items: (educationText || '')
          .split(/\n+/)
          .map(l => l.trim())
          .filter(Boolean)
          .map(line => {
            const [degree = '', field = '', institution = '', period = ''] = line.split('|').map(s => s.trim());
            return { degree, field, institution, period };
          })
      };
      const experience = {
        items: (experienceText || '')
          .split(/\n+/)
          .map(l => l.trim())
          .filter(Boolean)
          .map(line => {
            const [role = '', company = '', period = '', detailsStr = ''] = line.split('|').map(s => s.trim());
            const details = detailsStr ? detailsStr.split(';').map(s => s.trim()).filter(Boolean) : [];
            return { role, company, period, details };
          })
      };
      const skills = { items: (skillsText || '').split(',').map(s => s.trim()).filter(Boolean) };
      const certifications = {
        items: (certsText || '')
          .split(/\n+/)
          .map(l => l.trim())
          .filter(Boolean)
          .map(line => {
            const [name = '', issuer = '', date = ''] = line.split('|').map(s => s.trim());
            return { name, issuer, date };
          })
      };

      const payload = { summary: form.summary, education, experience, skills, certifications };
      const res = await api('/api/cv', { method: 'PUT', data: payload });
      setMessage('Saved successfully');
      toast.add('CV saved', { type: 'success' });
      setForm({ summary: res.summary || '' });
      const eduItems = (res.education?.items || []).map(i => `${i.degree || ''} | ${i.field || ''} | ${i.institution || ''} | ${i.period || ''}`.trim());
      setEducationText(eduItems.join('\n'));
      const expItems = (res.experience?.items || []).map(i => {
        const details = Array.isArray(i.details) ? i.details.join('; ') : '';
        return `${i.role || ''} | ${i.company || ''} | ${i.period || ''} | ${details}`.trim();
      });
      setExperienceText(expItems.join('\n'));
      const skillItems2 = (res.skills?.items || []).join(', ');
      setSkillsText(skillItems2);
      const certItems = (res.certifications?.items || []).map(i => `${i.name || ''} | ${i.issuer || ''} | ${i.date || ''}`.trim());
      setCertsText(certItems.join('\n'));
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

        <div>
          <label className="block text-gray-300 mb-2">Education (one per line: degree | field | institution | period)</label>
          <textarea
            value={educationText}
            onChange={(e) => setEducationText(e.target.value)}
            className="w-full p-3 rounded bg-black/40 border border-white/10 text-gray-100 font-mono min-h-[140px]"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Experience (one per line: role | company | period | details; details; ...)</label>
          <textarea
            value={experienceText}
            onChange={(e) => setExperienceText(e.target.value)}
            className="w-full p-3 rounded bg-black/40 border border-white/10 text-gray-100 font-mono min-h-[160px]"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Skills (comma separated)</label>
          <textarea
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            className="w-full p-3 rounded bg-black/40 border border-white/10 text-gray-100 font-mono min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Certifications (one per line: name | issuer | date)</label>
          <textarea
            value={certsText}
            onChange={(e) => setCertsText(e.target.value)}
            className="w-full p-3 rounded bg-black/40 border border-white/10 text-gray-100 font-mono min-h-[120px]"
          />
        </div>

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
