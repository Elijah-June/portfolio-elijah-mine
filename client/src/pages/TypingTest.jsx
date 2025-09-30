import React, { useEffect, useMemo, useRef, useState } from 'react';
import Animate from '../components/Animate.jsx';

const WORDS = (
  'time year people way day man thing woman life child world school state family student group country problem hand part place case week company system program question work government number night point home water room mother area money story fact month lot right study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name president team minute idea kid body information back parent face others level office door health person art war history party result change morning reason research girl guy moment air teacher force education foot boy age policy everything process music market sense service area'.split(' ')
);

function makeText(n = 60) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  return out.join(' ');
}

export default function TypingTest() {
  const [duration, setDuration] = useState(60); // seconds
  const [target, setTarget] = useState(makeText(80));
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [secsLeft, setSecsLeft] = useState(duration);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const stats = useMemo(() => {
    const len = typed.length;
    let correct = 0;
    for (let i = 0; i < len; i++) {
      if (typed[i] === target[i]) correct++;
    }
    const elapsed = started ? (duration - secsLeft) : 0;
    const minutes = Math.max(1 / 60, elapsed / 60);
    const wpm = Math.round((correct / 5) / minutes);
    const acc = len === 0 ? 100 : Math.round((correct / len) * 100);
    return { correct, len, wpm, acc, elapsed };
  }, [typed, target, duration, secsLeft, started]);

  useEffect(() => {
    if (!started) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  function start() {
    setStarted(true);
    setFinished(false);
    setSecsLeft(duration);
    inputRef.current?.focus();
  }

  function reset(newText = false) {
    setTyped('');
    setStarted(false);
    setFinished(false);
    setSecsLeft(duration);
    if (newText) setTarget(makeText(80));
    inputRef.current?.focus();
  }

  function handleChange(e) {
    if (!started) setStarted(true);
    if (finished) return;
    const v = e.target.value;
    // limit length to target length
    if (v.length > target.length) return;
    setTyped(v);
  }

  function renderText() {
    const spans = [];
    for (let i = 0; i < target.length; i++) {
      const ch = target[i] || ' ';
      let cls = 'text-gray-400';
      if (i < typed.length) {
        cls = typed[i] === ch ? 'text-emerald-300' : 'text-red-400';
      }
      spans.push(<span key={i} className={cls}>{ch}</span>);
    }
    // caret
    const caretIdx = Math.min(typed.length, target.length - 1);
    spans.splice(caretIdx, 0, <span key={'caret'} className="w-[2px] h-5 bg-white inline-block animate-pulse align-text-bottom" />);
    return spans;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3 py-2 rounded border border-white/10 bg-white/5">Time: <b>{secsLeft}s</b></div>
        <div className="px-3 py-2 rounded border border-white/10 bg-white/5">WPM: <b>{stats.wpm}</b></div>
        <div className="px-3 py-2 rounded border border-white/10 bg-white/5">Accuracy: <b>{stats.acc}%</b></div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <button onClick={() => { setDuration(15); reset(true); }} className={`px-2 py-1 rounded ${duration===15?'bg-white text-black':'bg-white/10'}`}>15s</button>
          <button onClick={() => { setDuration(30); reset(true); }} className={`px-2 py-1 rounded ${duration===30?'bg-white text-black':'bg-white/10'}`}>30s</button>
          <button onClick={() => { setDuration(60); reset(true); }} className={`px-2 py-1 rounded ${duration===60?'bg-white text-black':'bg-white/10'}`}>60s</button>
        </div>
      </div>

      <Animate type="fade">
        <div className="p-4 rounded border border-white/10 bg-white/5 min-h-[130px] text-xl leading-8 font-mono whitespace-pre-wrap break-words">
          {renderText()}
        </div>
      </Animate>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          className="w-full border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 rounded font-mono"
          placeholder={started ? 'Type here…' : 'Press Start or begin typing…'}
          value={typed}
          onChange={handleChange}
          onFocus={() => !started && setTyped(typed)}
        />
        <button onClick={start} className="px-4 py-2 bg-white text-black rounded">Start</button>
        <button onClick={() => reset(false)} className="px-4 py-2 bg-white/10 rounded">Reset</button>
        <button onClick={() => reset(true)} className="px-4 py-2 bg-white/10 rounded">New Text</button>
      </div>

      {finished && (
        <div className="p-4 rounded border border-white/10 bg-white/5">
          <div className="text-lg font-semibold">Results</div>
          <div className="text-sm text-gray-300 mt-2">WPM: <b>{stats.wpm}</b> | Accuracy: <b>{stats.acc}%</b> | Keystrokes: <b>{stats.len}</b> | Correct chars: <b>{stats.correct}</b></div>
        </div>
      )}
    </div>
  );
}
