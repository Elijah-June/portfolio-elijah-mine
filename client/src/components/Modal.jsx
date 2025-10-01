import React from 'react';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 animate-fade" onClick={onClose} />
      <div className="relative border border-white/10 bg-white/5 backdrop-blur rounded-xl shadow-xl w-full max-w-2xl p-5 animate-zoom">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button className="text-gray-300" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
