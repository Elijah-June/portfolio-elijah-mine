import React from 'react';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
