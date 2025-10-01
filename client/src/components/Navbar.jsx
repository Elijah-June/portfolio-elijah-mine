import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Link({ to, children, ...props }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'px-3 py-2 rounded hover:bg-white/10 text-gray-100 ' + (isActive ? 'font-semibold' : '')
      }
      {...props}
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">Portfolio</span>
          <nav className="ml-4 hidden md:flex gap-1">
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
          <button
            className="md:hidden p-2 rounded hover:bg-white/10"
            aria-label="Toggle menu"
            onClick={() => setOpen(o => !o)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/80">
          <nav className="container mx-auto px-4 py-2 flex flex-col gap-1">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/projects" onClick={() => setOpen(false)}>Projects</Link>
            <Link to="/blog" onClick={() => setOpen(false)}>Blog</Link>
            <Link to="/calendar" onClick={() => setOpen(false)}>Calendar</Link>
            <Link to="/typing" onClick={() => setOpen(false)}>Typing</Link>
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
