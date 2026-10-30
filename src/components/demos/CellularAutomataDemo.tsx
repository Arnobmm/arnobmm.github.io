import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Shuffle, Sparkles } from 'lucide-react';

export const CellularAutomataDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [aliveCount, setAliveCount] = useState(0);
  const [speed, setSpeed] = useState<number>(80); // ms per step
  const [selectedBrush, setSelectedBrush] = useState<'pen' | 'glider' | 'pulsar'>('pen');

  const rows = 40;
  const cols = 70;
  const cellSize = 12;

  // Grid ref to avoid closure staleness in timer loops
  const gridRef = useRef<Uint8Array>(new Uint8Array(rows * cols));

  const getIdx = (r: number, c: number) => r * cols + c;

  const countNeighbors = (grid: Uint8Array, r: number, c: number) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nr = (r + i + rows) % rows;
        const nc = (c + j + cols) % cols;
        if (grid[getIdx(nr, nc)] === 1) count++;
      }
    }
    return count;
  };

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0d0d11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(cols * cellSize, r * cellSize);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, rows * cellSize);
      ctx.stroke();
    }

    // Draw alive cells with cyan/lime glow
    const grid = gridRef.current;
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[getIdx(r, c)] === 1) {
          count++;
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 4;
          ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
          ctx.shadowBlur = 0;
        }
      }
    }
    setAliveCount(count);
  }, [rows, cols, cellSize]);

  const stepSimulation = useCallback(() => {
    const current = gridRef.current;
    const next = new Uint8Array(rows * cols);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const neighbors = countNeighbors(current, r, c);
        const idx = getIdx(r, c);
        const alive = current[idx] === 1;

        if (alive && (neighbors === 2 || neighbors === 3)) {
          next[idx] = 1;
        } else if (!alive && neighbors === 3) {
          next[idx] = 1;
        } else {
          next[idx] = 0;
        }
      }
    }

    gridRef.current = next;
    setGeneration((prev) => prev + 1);
    drawGrid();
  }, [rows, cols, drawGrid]);

  const randomizeGrid = useCallback(() => {
    const next = new Uint8Array(rows * cols);
    for (let i = 0; i < rows * cols; i++) {
      next[i] = Math.random() > 0.8 ? 1 : 0;
    }
    gridRef.current = next;
    setGeneration(0);
    drawGrid();
  }, [rows, cols, drawGrid]);

  const clearGrid = useCallback(() => {
    gridRef.current = new Uint8Array(rows * cols);
    setGeneration(0);
    drawGrid();
  }, [rows, cols, drawGrid]);

  const spawnGlider = (r: number, c: number) => {
    const coords = [
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ];
    coords.forEach(([dr, dc]) => {
      const nr = (r + dr + rows) % rows;
      const nc = (c + dc + cols) % cols;
      gridRef.current[getIdx(nr, nc)] = 1;
    });
    drawGrid();
  };

  const spawnPulsar = (r: number, c: number) => {
    const pattern = [
      [2, 4], [2, 5], [2, 6], [2, 10], [2, 11], [2, 12],
      [4, 2], [4, 7], [4, 9], [4, 14],
      [5, 2], [5, 7], [5, 9], [5, 14],
      [6, 2], [6, 7], [6, 9], [6, 14],
      [7, 4], [7, 5], [7, 6], [7, 10], [7, 11], [7, 12],
    ];
    pattern.forEach(([dr, dc]) => {
      const nr = (r + dr - 5 + rows) % rows;
      const nc = (c + dc - 7 + cols) % cols;
      gridRef.current[getIdx(nr, nc)] = 1;
    });
    drawGrid();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const c = Math.floor(x / cellSize);
    const r = Math.floor(y / cellSize);

    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      if (selectedBrush === 'pen') {
        const idx = getIdx(r, c);
        gridRef.current[idx] = gridRef.current[idx] === 1 ? 0 : 1;
        drawGrid();
      } else if (selectedBrush === 'glider') {
        spawnGlider(r, c);
      } else if (selectedBrush === 'pulsar') {
        spawnPulsar(r, c);
      }
    }
  };

  // Seed default pattern on mount
  useEffect(() => {
    randomizeGrid();
  }, [randomizeGrid]);

  // Simulation tick timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(stepSimulation, speed);
    return () => clearInterval(interval);
  }, [isRunning, speed, stepSimulation]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#09090c] p-4 text-white">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/8 text-xs font-mono-code">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
              isRunning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={stepSimulation}
            disabled={isRunning}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>
          <button
            onClick={randomizeGrid}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 cursor-pointer flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random</span>
          </button>
          <button
            onClick={clearGrid}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Brush Tools */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/8">
          <button
            onClick={() => setSelectedBrush('pen')}
            className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
              selectedBrush === 'pen' ? 'bg-white/20 text-white font-bold' : 'text-neutral-400'
            }`}
          >
            Pencil
          </button>
          <button
            onClick={() => setSelectedBrush('glider')}
            className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
              selectedBrush === 'glider' ? 'bg-white/20 text-white font-bold' : 'text-neutral-400'
            }`}
          >
            Glider
          </button>
          <button
            onClick={() => setSelectedBrush('pulsar')}
            className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
              selectedBrush === 'pulsar' ? 'bg-white/20 text-white font-bold' : 'text-neutral-400'
            }`}
          >
            Pulsar
          </button>
        </div>

        {/* Telemetry info */}
        <div className="flex items-center gap-4 text-neutral-400">
          <span>Gen: <strong className="text-white">{generation}</strong></span>
          <span>Alive: <strong className="text-cyan-400">{aliveCount}</strong></span>
        </div>
      </div>

      {/* Main Simulation Canvas */}
      <div className="relative my-3 flex items-center justify-center overflow-auto rounded-xl border border-white/10 bg-[#0d0d11]">
        <canvas
          ref={canvasRef}
          width={cols * cellSize}
          height={rows * cellSize}
          onClick={handleCanvasClick}
          className="cursor-crosshair max-w-full"
        />
      </div>

      {/* Bottom helper tip */}
      <div className="text-[11px] font-mono-code text-neutral-500 text-center">
        Tip: Click on the grid to toggle cells or stamp patterns using the selected brush tool.
      </div>
    </div>
  );
};
