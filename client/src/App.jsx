import React from 'react';
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

export default function App() {
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
      </footer>
    </div>
  );
}
