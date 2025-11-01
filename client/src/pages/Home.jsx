import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Quote from '../components/Quote.jsx';
import { Link } from 'react-router-dom';
import Animate from '../components/Animate.jsx';
import useTypewriter from '../hooks/useTypewriter.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Home() {
  const [profile, setProfile] = useState(null);
  const typedTitle = useTypewriter(profile?.title || '', 40, true);
  const [visitors, setVisitors] = useState(null);
  const { add: addToast } = useToast();

  useEffect(() => {
    api('/api/profile').then(setProfile).catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    const flag = typeof window !== 'undefined' ? window.localStorage.getItem('hasVisited') : '1';
    const isFirstVisit = !flag;
    const method = isFirstVisit ? 'POST' : 'GET';
    api('/api/visitors', { method })
      .then((res) => {
        setVisitors(res?.total ?? null);
        if (isFirstVisit && typeof window !== 'undefined') {
          window.localStorage.setItem('hasVisited', '1');
          if (res?.total != null) {
            addToast(`Thanks for visiting! You are visitor #${res.total}.`, { type: 'success', duration: 3500 });
          } else {
            addToast('Thanks for visiting!', { type: 'success', duration: 3000 });
          }
        }
      })
      .catch(() => setVisitors(null));
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/10">
        <div className="px-6 py-12 md:px-12 md:py-16 grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <Animate type="fade">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                  {profile?.display_name || 'Your Name'}
                </span>
              </h1>
            </Animate>
            {profile?.title && (
              <Animate type="fade" delay={80}>
                <p className="text-gray-300 mt-2 text-lg">
                  {typedTitle}
                  <span className="inline-block w-2 h-5 -mb-1 bg-white/80 ml-1 animate-pulse" />
                </p>
              </Animate>
            )}
            {visitors !== null && (
              <Animate type="fade" delay={100}>
                <p className="text-gray-400 mt-2 text-sm">Visitors: {visitors}</p>
              </Animate>
            )}
            {profile?.bio && (
              <Animate type="fade" delay={120}><p className="text-gray-300/90 mt-4 max-w-2xl">{profile.bio}</p></Animate>
            )}
            <Animate type="zoom" delay={160}>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="px-5 py-2 rounded bg-white text-black font-medium hover:opacity-90 transition" to="/projects">View Projects</Link>
                <Link className="px-5 py-2 rounded border border-white/20 hover:bg-white/10 transition" to="/blog">Read Blog</Link>
                {profile?.social_links?.website && (
                  <a className="px-4 py-2 rounded border border-white/20 hover:bg-white/10 transition text-gray-200" href={profile.social_links.website} target="_blank" rel="noreferrer">Website</a>
                )}
                {profile?.social_links?.github && (
                  <a className="px-4 py-2 rounded border border-white/20 hover:bg-white/10 transition text-gray-200" href={profile.social_links.github} target="_blank" rel="noreferrer">GitHub</a>
                )}
                {profile?.social_links?.linkedin && (
                  <a className="px-4 py-2 rounded border border-white/20 hover:bg-white/10 transition text-gray-200" href={profile.social_links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                )}
                {profile?.social_links?.twitter && (
                  <a className="px-4 py-2 rounded border border-white/20 hover:bg-white/10 transition text-gray-200" href={profile.social_links.twitter} target="_blank" rel="noreferrer">Twitter</a>
                )}
                {(profile?.social_links?.cv || profile?.social_links?.cv_url) && (
                  <a className="px-4 py-2 rounded border border-white/20 hover:bg-white/10 transition text-gray-200" href={profile.social_links.cv || profile.social_links.cv_url} target="_blank" rel="noreferrer">CV</a>
                )}
              </div>
            </Animate>
          </div>
          <div className="flex justify-center md:justify-end">
            {profile?.avatar_url && (
              <Animate type="zoom" delay={80}><img src={profile.avatar_url} alt="" className="w-40 h-40 md:w-56 md:h-56 rounded-2xl object-cover ring-1 ring-white/20" /></Animate>
            )}
          </div>
        </div>
      </section>

      {/* Quote widget */}
      <Quote />

      {/* About section */}
      {profile && (
        <section className="grid md:grid-cols-3 gap-6">
          <Animate type="fade"><div className="p-5 rounded border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <p className="text-gray-300 mt-2 whitespace-pre-line">{profile.profile_summary || profile.bio || '—'}</p>
          </div></Animate>
          <Animate type="fade" delay={60}><div className="p-5 rounded border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white">Education</h2>
            <p className="text-gray-300 mt-2 whitespace-pre-line">{profile.education || '—'}</p>
          </div></Animate>
          <Animate type="fade" delay={120}><div className="p-5 rounded border border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white">Expertise</h2>
            <p className="text-gray-300 mt-2 whitespace-pre-line">{profile.expertise || '—'}</p>
          </div></Animate>
        </section>
      )}
    </div>
  );
}
