import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Quote() {
  const [quote, setQuote] = useState(null);
  useEffect(() => {
    api('/api/quotes/daily').then(setQuote).catch(() => {});
  }, []);
  if (!quote) return null;
  return (
    <div className="p-4 rounded border border-amber-400/30 bg-amber-500/10">
      <p className="italic text-amber-100">“{quote.text}”</p>
      {quote.author && <p className="text-right mt-2 text-amber-200">— {quote.author}</p>}
    </div>
  );
}
