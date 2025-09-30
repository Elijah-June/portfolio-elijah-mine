import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticlesBg() {
  const init = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={init}
      className="fixed inset-0 -z-10"
      options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          number: { value: 50, density: { enable: true, area: 800 } },
          color: { value: '#ffffff' },
          opacity: { value: 0.06 },
          size: { value: { min: 1, max: 2 } },
          move: { enable: true, speed: 0.6 },
        },
        interactivity: {
          events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
          modes: { repulse: { distance: 100, duration: 0.4 } },
        },
        detectRetina: true,
      }}
    />
  );
}
