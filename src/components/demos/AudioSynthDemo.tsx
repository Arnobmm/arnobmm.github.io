import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Play, Music, Radio } from 'lucide-react';

interface Note {
  name: string;
  freq: number;
  isBlack?: boolean;
}

const NOTES: Note[] = [
  { name: 'C4', freq: 261.63 },
  { name: 'C#4', freq: 277.18, isBlack: true },
  { name: 'D4', freq: 293.66 },
  { name: 'D#4', freq: 311.13, isBlack: true },
  { name: 'E4', freq: 329.63 },
  { name: 'F4', freq: 349.23 },
  { name: 'F#4', freq: 369.99, isBlack: true },
  { name: 'G4', freq: 392.0 },
  { name: 'G#4', freq: 415.3, isBlack: true },
  { name: 'A4', freq: 440.0 },
  { name: 'A#4', freq: 466.16, isBlack: true },
  { name: 'B4', freq: 493.88 },
  { name: 'C5', freq: 523.25 },
];

export const AudioSynthDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.2);
  const [octaveShift, setOctaveShift] = useState(0);

  // Active oscillators map
  const activeOscsRef = useRef<{ [key: string]: { osc: OscillatorNode; gain: GainNode } }>({});

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.connect(ctx.destination);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playNote = (note: Note) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    // Stop existing note if already held
    if (activeOscsRef.current[note.name]) {
      stopNote(note.name);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = note.freq * Math.pow(2, octaveShift);
    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Fast attack & sustain
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(analyser);

    osc.start();
    activeOscsRef.current[note.name] = { osc, gain };
    setActiveNote(note.name);
  };

  const stopNote = (noteName: string) => {
    const ctx = audioCtxRef.current;
    const item = activeOscsRef.current[noteName];
    if (ctx && item) {
      // Gentle decay release
      item.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      setTimeout(() => {
        try {
          item.osc.stop();
          item.osc.disconnect();
        } catch {}
      }, 160);
      delete activeOscsRef.current[noteName];
    }
    setActiveNote(null);
  };

  // Oscilloscope animation
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const renderWaveform = () => {
      animId = requestAnimationFrame(renderWaveform);
      const analyser = analyserRef.current;

      ctx2d.fillStyle = '#09090d';
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);

      if (!analyser) {
        // Draw static baseline
        ctx2d.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx2d.beginPath();
        ctx2d.moveTo(0, canvas.height / 2);
        ctx2d.lineTo(canvas.width, canvas.height / 2);
        ctx2d.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx2d.lineWidth = 2;
      ctx2d.strokeStyle = '#f97316';
      ctx2d.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx2d.moveTo(x, y);
        } else {
          ctx2d.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx2d.stroke();
    };

    renderWaveform();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0a0a0e] p-6 text-white rounded-xl">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8 text-xs font-mono-code">
        {/* Waveform Selector */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">Wave:</span>
          {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map((type) => (
            <button
              key={type}
              onClick={() => setWaveform(type)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[11px] font-bold cursor-pointer transition-all ${
                waveform === type
                  ? 'bg-[#f97316] text-black shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Octave & Volume */}
        <div className="flex items-center gap-4 text-neutral-300">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Octave:</span>
            <button
              onClick={() => setOctaveShift((prev) => Math.max(-1, prev - 1))}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
            >
              -1
            </button>
            <span className="font-bold text-white px-1">{octaveShift >= 0 ? `+${octaveShift}` : octaveShift}</span>
            <button
              onClick={() => setOctaveShift((prev) => Math.min(1, prev + 1))}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
            >
              +1
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-[#f97316]"
            />
          </div>
        </div>
      </div>

      {/* Real-time Oscilloscope Canvas */}
      <div className="my-6 rounded-xl overflow-hidden border border-white/10 bg-[#09090d]">
        <canvas ref={canvasRef} width={640} height={140} className="w-full h-32 block" />
      </div>

      {/* Musical Piano Keyboard */}
      <div className="flex justify-center items-end relative py-2 select-none overflow-x-auto">
        <div className="flex relative">
          {NOTES.map((note) => {
            const isHeld = activeNote === note.name;
            if (note.isBlack) {
              return (
                <button
                  key={note.name}
                  onPointerDown={() => playNote(note)}
                  onPointerUp={() => stopNote(note.name)}
                  onPointerLeave={() => stopNote(note.name)}
                  className={`w-8 h-24 -mx-4 z-20 rounded-b-md border border-neutral-700 transition-colors shadow-md ${
                    isHeld ? 'bg-[#f97316] border-[#f97316]' : 'bg-neutral-900 active:bg-[#f97316]'
                  }`}
                  style={{ position: 'relative' }}
                >
                  <span className="text-[9px] font-mono-code text-neutral-400 absolute bottom-1 left-1/2 -translate-x-1/2">
                    {note.name}
                  </span>
                </button>
              );
            } else {
              return (
                <button
                  key={note.name}
                  onPointerDown={() => playNote(note)}
                  onPointerUp={() => stopNote(note.name)}
                  onPointerLeave={() => stopNote(note.name)}
                  className={`w-12 h-36 rounded-b-lg border border-neutral-700 transition-colors relative flex flex-col justify-end p-2 cursor-pointer ${
                    isHeld ? 'bg-neutral-300' : 'bg-neutral-800 hover:bg-neutral-700'
                  }`}
                >
                  <span className="text-xs font-mono-code text-neutral-400 font-bold block text-center">
                    {note.name}
                  </span>
                </button>
              );
            }
          })}
        </div>
      </div>

      <div className="text-[11px] font-mono-code text-neutral-500 text-center pt-2">
        Click or tap keys to synthesize real-time waveforms.
      </div>
    </div>
  );
};
