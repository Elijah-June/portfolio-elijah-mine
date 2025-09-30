import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ author_name: '', body: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    api(`/api/blogs/${slug}`).then(setPost);
  }, [slug]);

  useEffect(() => {
    if (post?.id) {
      api(`/api/blogs/${post.id}/comments`).then(setComments);
    }
  }, [post]);

  async function submitComment(e) {
    e.preventDefault();
    setError('');
    try {
      let image_url = null;
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        const up = await api('/api/uploads', { method: 'POST', body: fd });
        image_url = up.url; // '/uploads/...'
      }
      const c = await api(`/api/blogs/${post.id}/comments`, { method: 'POST', data: { ...form, image_url } });
      setComments(prev => [...prev, c]);
      setForm({ author_name: '', body: '' });
      setFile(null);
    } catch (err) {
      setError(err.message || 'Error');
    }
  }

  function countWords(md) {
    const text = (md || '').replace(/[`#*_>\-]/g, ' ').replace(/\!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[[^\]]*\]\([^)]*\)/g, '');
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function readingTime(md) {
    const words = countWords(md);
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }

  function share() {
    const url = window.location.href;
    const text = `Check out: ${post?.title}`;
    if (navigator.share) {
      navigator.share({ title: post?.title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      alert('Link copied to clipboard');
    }
  }

  async function react(commentId, type) {
    const obj = await api(`/api/blogs/comments/${commentId}/reactions`, { method: 'POST', data: { type } });
    setComments(cs => cs.map(c => c.id === commentId ? { ...c, reactions: obj } : c));
  }

  if (!post) return <div>Loading...</div>;

  const rt = readingTime(post.content_md || '');

  return (
    <div className="space-y-6">
      <div className="p-4 border border-white/10 rounded bg-white/5">
        <h1 className="text-2xl font-bold text-white">{post.title}</h1>
        <p className="text-xs text-gray-400 flex items-center gap-3">
          <span>{new Date(post.created_at).toLocaleString()}</span>
          <span>•</span>
          <span>{rt.minutes} min read</span>
          <button onClick={share} className="ml-auto text-blue-300 hover:underline">Share</button>
        </p>
        <div className="markdown prose max-w-none mt-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content_md || ''}
          </ReactMarkdown>
        </div>
      </div>

      <div className="p-4 border border-white/10 rounded bg-white/5">
        <h2 className="text-lg font-semibold mb-3 text-white">Comments</h2>
        <form className="space-y-2 mb-4" onSubmit={submitComment}>
          <input
            className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded"
            placeholder="Your name"
            value={form.author_name}
            onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
          />
          <textarea
            className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded"
            placeholder="Write a comment..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          />
          <div className="flex items-center justify-between gap-3">
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
            {file && <span className="text-xs text-gray-400">{file.name}</span>}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="px-4 py-2 bg-white text-black rounded">Post Comment</button>
        </form>

        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="border border-white/10 rounded p-3 bg-white/5">
              <div className="text-sm font-medium text-white">{c.author_name}</div>
              <div className="text-sm text-gray-200">{c.body}</div>
              {c.image_url && (
                <div className="mt-2">
                  <img src={`${API_BASE}${c.image_url}`} alt="" className="max-h-64 rounded border border-white/10" />
                </div>
              )}
              <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                {['like','heart','clap'].map(t => (
                  <button key={t} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                    onClick={() => react(c.id, t)}>
                    {t} {c.reactions?.[t] ? c.reactions[t] : 0}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {comments.length === 0 && <div className="text-sm text-gray-400">No comments yet.</div>}
        </div>
      </div>
    </div>
  );
}
