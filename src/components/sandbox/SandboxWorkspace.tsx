import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Compass,
} from 'lucide-react';
import {
  ElementType,
  ELEMENT_DEFS,
  PowderSimulationGrid,
  GravityDirection,
} from './PowderAlchemyCore';
import { ElementPicker } from './ElementPicker';
import { sounds } from '../../utils/soundEffects';

interface SandboxWorkspaceProps {
  initialPreset?: 'crucible' | 'biolab' | 'refinery' | 'clean';
  onExitFullscreen?: () => void;
  className?: string;
}

export const SandboxWorkspace: React.FC<SandboxWorkspaceProps> = ({
  initialPreset = 'crucible',
  onExitFullscreen,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<PowderSimulationGrid | null>(null);

  // UI State
  const [selectedElement, setSelectedElement] = useState<ElementType>(ElementType.SAND);
  const [brushSize, setBrushSize] = useState<number>(5);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [gravity, setGravity] = useState<GravityDirection>('down');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [particleCount, setParticleCount] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>(initialPreset);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Pointer drawing tracking
  const isPointerDownRef = useRef<boolean>(false);
  const pointerButtonRef = useRef<number>(0); // 0 = left, 2 = right
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize simulation grid
  useEffect(() => {
    const grid = new PowderSimulationGrid(200, 140);
    grid.loadPreset(initialPreset);
    simRef.current = grid;
    setParticleCount(grid.particleCount);
  }, [initialPreset]);

  // Handle Gravity state change
  const handleToggleGravity = () => {
    sounds.bleep();
    setGravity((prev) => {
      const next = prev === 'down' ? 'zero' : prev === 'zero' ? 'up' : 'down';
      if (simRef.current) simRef.current.gravity = next;
      return next;
    });
  };

  // Preset scene loader
  const handleLoadPreset = (preset: 'crucible' | 'biolab' | 'refinery' | 'clean') => {
    sounds.chime();
    setActivePreset(preset);
    if (simRef.current) {
      simRef.current.loadPreset(preset);
      setParticleCount(simRef.current.particleCount);
    }
  };

  // Convert client viewport coordinates to simulation grid coordinates
  const getSimCoords = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 200 / rect.width;
    const scaleY = 140 / rect.height;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);
    return { x, y };
  }, []);

  // Stroke interpolation to prevent gaps when moving cursor fast
  const paintStroke = useCallback(
    (x1: number, y1: number, x2: number, y2: number, type: ElementType, size: number) => {
      const sim = simRef.current;
      if (!sim) return;

      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(dist / 2));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = Math.round(x1 + (x2 - x1) * t);
        const cy = Math.round(y1 + (y2 - y1) * t);
        sim.paint(cx, cy, size, type);
      }
    },
    []
  );

  // Mouse & Touch Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    isPointerDownRef.current = true;
    pointerButtonRef.current = e.button;

    const coords = getSimCoords(e.clientX, e.clientY);
    if (!coords) return;

    lastPointerPosRef.current = coords;
    const elemToUse = e.button === 2 ? ElementType.ERASER : selectedElement;
    simRef.current?.paint(coords.x, coords.y, brushSize, elemToUse);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getSimCoords(e.clientX, e.clientY);
    if (coords) {
      setCursorPos({ x: e.clientX, y: e.clientY, visible: true });
    }

    if (!isPointerDownRef.current || !coords) return;

    const last = lastPointerPosRef.current || coords;
    const elemToUse = pointerButtonRef.current === 2 ? ElementType.ERASER : selectedElement;
    paintStroke(last.x, last.y, coords.x, coords.y, elemToUse, brushSize);
    lastPointerPosRef.current = coords;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = false;
    lastPointerPosRef.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore pointer capture release error if already detached
    }
  };

  const handlePointerLeave = () => {
    setCursorPos((prev) => ({ ...prev, visible: false }));
  };

  // Mouse wheel to change brush size dynamically
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    setBrushSize((prev) => Math.min(24, Math.max(1, prev + delta)));
  };

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    sounds.pop();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      if (onExitFullscreen) onExitFullscreen();
    }
  };

  // Listen to external fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Main Render & Simulation Loop (60 FPS)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 200;
    const height = 140;
    const imgData = ctx.createImageData(width, height);
    const data32 = new Uint32Array(imgData.data.buffer);

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);
      const sim = simRef.current;
      if (!sim) return;

      // Update simulation physics
      if (isPlaying) {
        // Handle speed multiplier
        const steps = simSpeed === 2 ? 2 : 1;
        if (simSpeed === 0.5) {
          if (frameCount % 2 === 0) sim.step();
        } else {
          for (let s = 0; s < steps; s++) {
            sim.step();
          }
        }
      }

      // Draw pixels into ImageData buffer
      const grid = sim.grid;
      const temp = sim.temp;

      for (let i = 0; i < grid.length; i++) {
        const type = grid[i];

        if (type === ElementType.EMPTY) {
          // Deep cosmic midnight background
          data32[i] = 0xff160c0a; // ABGR: R=10, G=12, B=22
        } else {
          const def = ELEMENT_DEFS[type];
          if (!def) {
            data32[i] = 0xffffffff;
            continue;
          }

          let r = def.color[0];
          let g = def.color[1];
          let b = def.color[2];

          // Texture variance
          if (def.colorVar) {
            const v = ((i * 13) % (def.colorVar * 2)) - def.colorVar;
            r = Math.min(255, Math.max(0, r + v));
            g = Math.min(255, Math.max(0, g + v));
            b = Math.min(255, Math.max(0, b + v));
          }

          // Thermal glow for hot objects (> 400°C)
          const cellTemp = temp[i];
          if (cellTemp > 400 && type !== ElementType.FIRE && type !== ElementType.LAVA) {
            const glow = Math.min(100, Math.floor((cellTemp - 400) * 0.15));
            r = Math.min(255, r + glow);
            g = Math.min(255, g + Math.floor(glow * 0.4));
          }

          data32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // FPS & Telemetry calculations
      frameCount++;
      if (time - lastFpsUpdate >= 500) {
        const currentFps = Math.round((frameCount * 1000) / (time - lastFpsUpdate));
        setFps(currentFps);
        setParticleCount(sim.particleCount);
        frameCount = 0;
        lastFpsUpdate = time;
      }
      lastTime = time;
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, simSpeed]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-[#07080f] rounded-3xl overflow-hidden select-none border border-white/10 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
    >
      {/* Top Header / Control Deck */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0c0e1a]/90 backdrop-blur-md border-b border-white/10 z-20">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-pulse" />
            <h2 className="text-sm font-bold tracking-tight text-white font-['Rajdhani',sans-serif] uppercase">
              Sandbox: Powder Alchemy
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>{fps} FPS</span>
            <span aria-hidden="true">·</span>
            <span>{particleCount.toLocaleString()} particles</span>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              sounds.pop();
              setIsPlaying(!isPlaying);
            }}
            title={isPlaying ? 'Pause simulation' : 'Resume simulation'}
            className={`min-h-[38px] min-w-[38px] px-2.5 rounded-lg flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            onClick={() => {
              sounds.bleep();
              setIsPlaying(false);
              simRef.current?.step();
            }}
            title="Step 1 frame forward"
            className="min-h-[38px] min-w-[38px] px-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={() => {
              sounds.bleep();
              setSimSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1));
            }}
            title="Simulation speed"
            className="min-h-[38px] px-2.5 text-xs font-mono font-semibold rounded-lg text-slate-300 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
          >
            {simSpeed}x
          </button>

          <button
            onClick={handleToggleGravity}
            title={`Gravity: ${gravity}`}
            className="min-h-[38px] px-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-1.5 text-xs font-medium transition-all"
          >
            <Compass
              size={15}
              className={`transition-transform ${
                gravity === 'zero' ? 'opacity-30' : gravity === 'up' ? 'rotate-180 text-violet-400' : 'text-amber-400'
              }`}
            />
            <span className="capitalize">{gravity}</span>
          </button>
        </div>

        {/* Right: Presets & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Preset scene buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => handleLoadPreset('crucible')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                activePreset === 'crucible'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crucible
            </button>
            <button
              onClick={() => handleLoadPreset('biolab')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                activePreset === 'biolab'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Biolab
            </button>
            <button
              onClick={() => handleLoadPreset('refinery')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                activePreset === 'refinery'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Refinery
            </button>
          </div>

          {/* Clear Canvas */}
          <button
            onClick={() => {
              sounds.chime();
              simRef.current?.clear();
              setParticleCount(0);
            }}
            title="Clear canvas"
            className="min-h-[38px] min-w-[38px] px-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 flex items-center justify-center transition-all"
          >
            <RotateCcw size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="min-h-[38px] min-w-[38px] px-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 hover:text-white flex items-center justify-center transition-all"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-[#07080f]">
        <canvas
          ref={canvasRef}
          width={200}
          height={140}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          style={{ imageRendering: 'pixelated' }}
          className="w-full h-full object-contain cursor-crosshair touch-none select-none"
        />

        {/* Floating Brush Size Indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#090b14]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300">
          <Sliders size={14} className="text-amber-400" />
          <span>Brush: {brushSize}px</span>
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => setBrushSize((prev) => Math.max(1, prev - 1))}
              className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
            >
              -
            </button>
            <button
              onClick={() => setBrushSize((prev) => Math.min(24, prev + 1))}
              className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* On-screen hint for Desktop users */}
        <div className="hidden md:flex absolute top-4 right-4 z-10 items-center gap-2 bg-[#090b14]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-400">
          <span>Scroll wheel to resize brush · Right-click to erase</span>
        </div>
      </div>

      {/* Bottom Element Drawer */}
      <div className="bg-[#0b0d1a] border-t border-white/10 p-3 z-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          {/* Drawer Toggle Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles size={14} className="text-amber-400" />
              <span>Elemental Alchemy Tools</span>
            </div>

            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
            >
              <span>{isDrawerOpen ? 'Collapse Palette' : 'Expand Palette'}</span>
              {isDrawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {/* Expanded Element Palette */}
          {isDrawerOpen && (
            <div className="pt-1">
              <ElementPicker
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
