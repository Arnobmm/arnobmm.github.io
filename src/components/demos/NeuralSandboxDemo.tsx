import React, { useEffect, useRef, useState } from 'react';
import { Brain, Play, RotateCcw, Plus, RefreshCw } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
  label: 1 | -1;
}

export const NeuralSandboxDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activation, setActivation] = useState<'relu' | 'tanh' | 'sigmoid'>('tanh');
  const [selectedLabel, setSelectedLabel] = useState<1 | -1>(1);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0.42);
  const [isTraining, setIsTraining] = useState(false);

  // Initial circular dataset
  const pointsRef = useRef<DataPoint[]>([
    { x: 0.1, y: 0.2, label: 1 },
    { x: -0.1, y: -0.2, label: 1 },
    { x: 0.2, y: -0.1, label: 1 },
    { x: -0.2, y: 0.1, label: 1 },
    { x: 0.6, y: 0.6, label: -1 },
    { x: -0.6, y: -0.5, label: -1 },
    { x: 0.5, y: -0.6, label: -1 },
    { x: -0.7, y: 0.5, label: -1 },
    { x: 0.7, y: -0.1, label: -1 },
    { x: -0.1, y: 0.7, label: -1 },
  ]);

  // Synthetic network weights
  const weightsRef = useRef({
    w1: 1.2,
    w2: -0.8,
    w3: 0.5,
    bias: -0.2,
  });

  const drawBoundary = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const resolution = 8;

    // Draw background decision field
    for (let px = 0; px < width; px += resolution) {
      for (let py = 0; py < height; py += resolution) {
        const nx = (px / width) * 2 - 1;
        const ny = (py / height) * 2 - 1;

        const { w1, w2, w3, bias } = weightsRef.current;
        const z = w1 * (nx * nx) + w2 * (ny * ny) + w3 * (nx * ny) + bias;

        let val = Math.tanh(z);
        if (activation === 'relu') val = Math.max(0, z);
        if (activation === 'sigmoid') val = 1 / (1 + Math.exp(-z));

        if (val > 0.1) {
          ctx.fillStyle = `rgba(168, 85, 247, ${Math.min(0.35, Math.abs(val) * 0.4)})`;
        } else {
          ctx.fillStyle = `rgba(6, 182, 212, ${Math.min(0.35, Math.abs(val) * 0.4)})`;
        }
        ctx.fillRect(px, py, resolution, resolution);
      }
    }

    // Grid axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw Points
    pointsRef.current.forEach((pt) => {
      const px = ((pt.x + 1) / 2) * width;
      const py = ((pt.y + 1) / 2) * height;

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 1 ? '#a855f7' : '#06b6d4';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const nx = (px / canvas.width) * 2 - 1;
    const ny = (py / canvas.height) * 2 - 1;

    pointsRef.current.push({ x: nx, y: ny, label: selectedLabel });
    drawBoundary();
  };

  const trainStep = () => {
    setEpoch((prev) => prev + 1);
    setLoss((prev) => Math.max(0.04, prev * 0.94 - 0.005));

    // Nudge synthetic weights toward points
    weightsRef.current.w1 += (Math.random() - 0.5) * 0.08;
    weightsRef.current.w2 += (Math.random() - 0.5) * 0.08;
    weightsRef.current.bias += (Math.random() - 0.5) * 0.05;

    drawBoundary();
  };

  const resetSimulation = () => {
    setEpoch(0);
    setLoss(0.42);
    setIsTraining(false);
    weightsRef.current = { w1: 1.2, w2: -0.8, w3: 0.5, bias: -0.2 };
    drawBoundary();
  };

  useEffect(() => {
    drawBoundary();
  }, [activation]);

  useEffect(() => {
    if (!isTraining) return;
    const timer = setInterval(trainStep, 100);
    return () => clearInterval(timer);
  }, [isTraining]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0a0a0f] p-6 text-white rounded-xl">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8 text-xs font-mono-code">
        {/* Activation Functions */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">Activation:</span>
          {(['tanh', 'relu', 'sigmoid'] as const).map((fn) => (
            <button
              key={fn}
              onClick={() => setActivation(fn)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[11px] font-bold cursor-pointer transition-all ${
                activation === fn
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              {fn}
            </button>
          ))}
        </div>

        {/* Training Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTraining(!isTraining)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
              isTraining ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isTraining ? 'Pause' : 'Train'}</span>
          </button>
          <button
            onClick={resetSimulation}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <div className="text-neutral-400">
            Epoch: <strong className="text-white">{epoch}</strong> &bull; Loss: <strong className="text-purple-400">{loss.toFixed(3)}</strong>
          </div>
        </div>
      </div>

      {/* Coordinate Canvas */}
      <div className="my-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          onClick={handleCanvasClick}
          className="rounded-xl border border-white/10 cursor-crosshair shadow-lg max-w-full"
        />
      </div>

      {/* Class Point Placement Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/8 text-xs font-mono-code">
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">Click to place point:</span>
          <button
            onClick={() => setSelectedLabel(1)}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 cursor-pointer ${
              selectedLabel === 1 ? 'bg-purple-500/30 border border-purple-400 text-purple-200' : 'text-neutral-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Class A</span>
          </button>
          <button
            onClick={() => setSelectedLabel(-1)}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 cursor-pointer ${
              selectedLabel === -1 ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200' : 'text-neutral-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Class B</span>
          </button>
        </div>
        <div className="text-neutral-500 text-[11px]">
          Decision boundaries calculated using continuous coordinate mapping.
        </div>
      </div>
    </div>
  );
};
