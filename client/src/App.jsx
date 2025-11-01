import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PageTransition from './components/PageTransition.jsx';
import ParticlesBg from './components/ParticlesBg.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import BlogList from './pages/BlogList.jsx';
import BlogPost from './pages/BlogPost.jsx';
import CalendarPage from './pages/Calendar.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProjects from './pages/admin/AdminProjects.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import CV from './pages/CV.jsx';
import AdminCV from './pages/admin/AdminCV.jsx';
import TypingTest from './pages/TypingTest.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { api } from './api/client.js';
import AdminBlogs from './pages/admin/AdminBlogs.jsx';

export default function App() {
  const [footerVisitors, setFooterVisitors] = useState(null);

  useEffect(() => {
    api('/api/visitors', { method: 'GET' })
      .then((res) => setFooterVisitors(res?.total ?? null))
      .catch(() => setFooterVisitors(null));
    const id = setInterval(() => {
      api('/api/visitors', { method: 'GET' })
        .then((res) => setFooterVisitors(res?.total ?? null))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <ParticlesBg />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-10 flex-1">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/typing" element={<TypingTest />} />
            <Route path="/cv" element={<CV />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/blogs" element={<AdminBlogs />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/cv" element={<AdminCV />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} My Portfolio
        {footerVisitors !== null && (
          <span className="ml-4 text-gray-500">Visitors: {footerVisitors}</span>
        )}
      </footer>
    </div>
  );
}
