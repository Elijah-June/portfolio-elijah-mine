import React from 'react';
import { useToast } from '../context/ToastContext.jsx';

export default function Toaster() {
  const { toasts, remove } = useToast();

  const bgFor = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-amber-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`min-w-[220px] max-w-[360px] text-white rounded shadow-lg ${bgFor(t.type)} px-4 py-3 flex items-start gap-3`}>
          <div className="flex-1 text-sm">{t.message}</div>
          <button onClick={() => remove(t.id)} className="text-white/90 hover:text-white">✕</button>
        </div>
      ))}
    </div>
  );
}
