import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Animate from '../components/Animate.jsx';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  useEffect(() => { api('/api/projects').then(setProjects); }, []);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {projects.map((p, i) => (
        <Animate key={p.id} type="fade" delay={i * 60}>
          <div className="p-4 border border-white/10 rounded bg-white/5 hover:bg-white/10 transition">
            <div className="flex items-start gap-3">
              {p.image_url && <img src={p.image_url} className="w-24 h-24 object-cover rounded" alt="" />}
              <div>
                <h3 className="font-semibold text-lg text-white">{p.title}</h3>
                {p.description && <p className="text-sm text-gray-200 mt-1">{p.description}</p>}
                <div className="mt-2 flex gap-2 text-sm">
                  {p.repo_url && <a className="text-blue-300" href={p.repo_url} target="_blank" rel="noreferrer">Repo</a>}
                  {p.demo_url && <a className="text-blue-300" href={p.demo_url} target="_blank" rel="noreferrer">Demo</a>}
                </div>
                {p.tags && p.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t, i) => <span key={i} className="text-xs bg-white/10 border border-white/10 px-2 py-0.5 rounded text-gray-200">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Animate>
      ))}
    </div>
  );
}
