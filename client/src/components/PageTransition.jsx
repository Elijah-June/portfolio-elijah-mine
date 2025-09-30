import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}
