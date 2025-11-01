import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminBlogs() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const { add: toast } = useToast();

  const loadBlogs = () => {
    api('/api/blogs')
      .then(setBlogs)
      .catch(() => setBlogs([]));
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast('Title is required', { type: 'error' });
    setLoading(true);
    try {
      await api('/api/blogs', {
        method: 'POST',
        data: { title: title.trim(), content_md: content, published },
      });
      setTitle('');
      setContent('');
      setPublished(true);
      toast('Blog created', { type: 'success' });
      loadBlogs();
    } catch (err) {
      toast(err?.body?.error || 'Failed to create blog', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Manage Blogs</h1>

      <form onSubmit={submit} className="space-y-4 p-4 rounded border border-white/10 bg-white/5">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 outline-none"
            placeholder="Blog title"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 outline-none"
            placeholder="Write your post in Markdown"
          />
        </div>
        <div className="flex items-center gap-2">
          <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <label htmlFor="published" className="text-sm text-gray-300">Published</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-white text-black font-medium disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Blog'}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Posts</h2>
        {blogs.length === 0 && <p className="text-gray-400">No posts yet.</p>}
        <ul className="space-y-2">
          {blogs.map((b) => (
            <li key={b.id} className="p-3 rounded border border-white/10 bg-white/5 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{b.title}</div>
                <div className="text-xs text-gray-400">/{b.slug} • {b.published ? 'Published' : 'Draft'}</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(b.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
