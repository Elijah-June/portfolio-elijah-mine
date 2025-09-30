import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Link({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'px-3 py-2 rounded hover:bg-white/10 text-gray-100 ' + (isActive ? 'font-semibold' : '')
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">Portfolio</span>
          <nav className="ml-4 flex gap-1">
            <Link to="/">Home</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/typing">Typing</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-300">{user.email}</span>
              <button
                className="px-3 py-1 bg-white text-black rounded"
                onClick={async () => { await logout(); navigate('/'); }}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Guest</span>
              <NavLink to="/login" className="px-3 py-1 bg-white text-black rounded">Login</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
