import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import Animate from '../components/Animate.jsx';

export default function Login() {
  const { login, user, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/admin';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await login(form.email, form.password);
      
      if (result.success) {
        // The actual navigation will happen from the useEffect when user state updates
        return;
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Animate type="zoom">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-gray-400 mt-1">Use your admin credentials to access the dashboard.</p>
          <form className="space-y-3 mt-6" onSubmit={submit}>
            <div className="space-y-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={isSubmitting || loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={isSubmitting || loading}
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="px-4 py-2 bg-white text-black rounded w-full hover:opacity-90 transition flex items-center justify-center"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </Animate>
    </div>
  );
}
