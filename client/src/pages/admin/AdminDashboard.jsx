import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/admin/projects" className="p-4 border border-white/10 rounded bg-white/5 hover:bg-white/10 transition">
          Manage Projects
        </Link>
        <Link to="/admin/profile" className="p-4 border border-white/10 rounded bg-white/5 hover:bg-white/10 transition">
          Edit Profile
        </Link>
        <Link to="/admin/cv" className="p-4 border border-white/10 rounded bg-white/5 hover:bg-white/10 transition">
          Edit CV
        </Link>
      </div>
    </div>
  );
}
