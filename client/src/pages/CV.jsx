import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function CV() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api('/api/cv');
        setData(res);
      } catch (e) {
        setError(e?.message || 'Failed to load CV');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-gray-300">Loading CV...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!data) return <div className="text-gray-400">No CV found.</div>;

  const education = data.education && typeof data.education === 'object' ? data.education : {};
  const experience = data.experience && typeof data.experience === 'object' ? data.experience : {};
  const skills = data.skills && typeof data.skills === 'object' ? data.skills : {};
  const certifications = data.certifications && typeof data.certifications === 'object' ? data.certifications : {};

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Curriculum Vitae</h1>
        {data.summary && <p className="text-gray-300 whitespace-pre-line">{data.summary}</p>}
      </header>

      {education.items?.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Education</h2>
          <ul className="space-y-3">
            {education.items.map((ed, idx) => (
              <li key={idx} className="p-4 rounded border border-white/10 bg-white/5">
                <div className="text-white font-medium">{ed.degree} {ed.field ? `- ${ed.field}` : ''}</div>
                <div className="text-gray-300">{ed.institution}</div>
                {ed.period && <div className="text-gray-400 text-sm">{ed.period}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {experience.items?.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Experience</h2>
          <ul className="space-y-3">
            {experience.items.map((ex, idx) => (
              <li key={idx} className="p-4 rounded border border-white/10 bg-white/5">
                <div className="text-white font-medium">{ex.role} {ex.company ? `@ ${ex.company}` : ''}</div>
                {ex.period && <div className="text-gray-400 text-sm">{ex.period}</div>}
                {Array.isArray(ex.details) && (
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    {ex.details.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {skills.items?.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.items.map((s, idx) => (
              <span key={idx} className="px-3 py-1 rounded bg-white/10 text-gray-100 border border-white/10">{s}</span>
            ))}
          </div>
        </section>
      )}

      {certifications.items?.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Certifications</h2>
          <ul className="space-y-2 text-gray-200">
            {certifications.items.map((c, idx) => (
              <li key={idx} className="p-3 rounded border border-white/10 bg-white/5">
                <div className="font-medium">{c.name}</div>
                {c.issuer && <div className="text-gray-400 text-sm">{c.issuer}</div>}
                {c.date && <div className="text-gray-400 text-sm">{c.date}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
