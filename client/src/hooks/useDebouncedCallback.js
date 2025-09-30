import { useRef, useMemo } from 'react';

export default function useDebouncedCallback(fn, delay = 200) {
  const timer = useRef(null);
  // Keep latest function reference
  const latest = useRef(fn);
  latest.current = fn;

  return useMemo(() => {
    return (...args) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        latest.current(...args);
      }, delay);
    };
  }, [delay]);
}
