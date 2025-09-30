import React, { useEffect, useRef } from 'react';

export default function Animate({ type = 'fade', delay = 0, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.style.animationDelay = `${delay}ms`;
          el.classList.add(type === 'zoom' ? 'animate-zoom' : 'animate-fade');
          obs.disconnect();
        }
      });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [type, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
