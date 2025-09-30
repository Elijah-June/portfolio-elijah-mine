import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { user, loading, isAdmin } = useAuth();
  const loc = useLocation();
  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}
