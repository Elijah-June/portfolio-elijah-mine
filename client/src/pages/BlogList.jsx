import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Link } from 'react-router-dom';
import Animate from '../components/Animate.jsx';

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { api('/api/blogs').then(setPosts); }, []);
  function excerpt(md, len = 160) {
    const text = (md || '').replace(/[#*_>`\-]/g, '').replace(/\!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[[^\]]*\]\([^)]*\)/g, '');
    return text.length > len ? text.slice(0, len).trim() + '…' : text;
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {posts.map((b, i) => (
        <Animate key={b.id} type="fade" delay={i * 60}>
          <div className="p-5 border border-white/10 rounded bg-white/5 hover:bg-white/10 transition">
            <h3 className="text-xl font-semibold">
              <Link className="text-white hover:underline" to={`/blog/${b.slug}`}>{b.title}</Link>
            </h3>
            <p className="text-xs text-gray-400 mt-1">{new Date(b.created_at).toLocaleString()}</p>
            <p className="mt-3 text-gray-200/90">{excerpt(b.content_md)}</p>
            <div className="mt-4">
              <Link className="text-blue-300 hover:underline" to={`/blog/${b.slug}`}>Read more →</Link>
            </div>
          </div>
        </Animate>
      ))}
    </div>
  );
}
