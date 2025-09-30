import { useEffect, useState } from 'react';

export default function useTypewriter(text = '', speed = 60, loop = false, pauseMs = 1200) {
  const [out, setOut] = useState('');
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const type = () => {
      if (cancelled) return;
      if (i <= text.length) {
        setOut(text.slice(0, i));
        i += 1;
        setTimeout(type, speed);
      } else if (loop) {
        setTimeout(() => {
          i = 0;
          setOut('');
          type();
        }, pauseMs);
      }
    };
    type();
    return () => { cancelled = true; };
  }, [text, speed, loop, pauseMs]);
  return out;
}
