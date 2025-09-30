import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import Animate from '../components/Animate.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/admin';

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Animate type="zoom">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-gray-400 mt-1">Use your admin credentials to access the dashboard.</p>
          <form className="space-y-3 mt-6" onSubmit={submit}>
            <input className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded" placeholder="Password" type="password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button className="px-4 py-2 bg-white text-black rounded w-full hover:opacity-90 transition">Login</button>
          </form>
        </div>
      </Animate>
    </div>
  );
}
