import React, { useState, useRef } from 'react';
import { Maximize2, Minimize2, RotateCcw, Volume2, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface RagdollEscapeDemoProps {
  onBack?: () => void;
}

export const RagdollEscapeDemo: React.FC<RagdollEscapeDemoProps> = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleFullscreen = () => {
    sounds.playPop();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fallback to CSS expanded mode
        setIsFullscreen((prev) => !prev);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  const reloadGame = () => {
    sounds.playBleep(520);
    if (iframeRef.current) {
      iframeRef.current.src = '/assets/aistudio/ragdoll_escape_2d_physics_platformer_adventure_5ddc9cff.html';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col bg-[#070a14] rounded-2xl md:rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_20px_60px_rgba(16,185,129,0.25)] transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[640px] md:h-[720px]'
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border-b border-emerald-500/20 backdrop-blur-md z-20 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-display font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
            <span>RAGDOLL ESCAPE</span>
            <span className="text-[10px] font-mono-code font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              12 LEVELS • VERLET ENGINE
            </span>
          </span>
        </div>

        {/* Quick controls hint */}
        <div className="hidden lg:flex items-center gap-4 text-slate-400 font-mono-code text-[11px]">
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">A</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">D</kbd> Move
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 ml-1">Space</kbd> Jump
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400/80" />
            <span>Touch overlay active on mobile</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={reloadGame}
            title="Restart Game / Level"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Play Fullscreen'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 transition-colors text-xs font-semibold cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Game IFrame */}
      <div className="relative flex-1 w-full h-full bg-[#070a14]">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070a14] z-10 text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 animate-bounce mb-4">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h4 className="text-lg font-display font-bold text-white mb-1">Loading Ragdoll Escape...</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Initializing Verlet physics engine, 11-node humanoid ragdoll constraints, audio synthesizers, and 12 puzzle levels.
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/assets/aistudio/ragdoll_escape_2d_physics_platformer_adventure_5ddc9cff.html"
          title="Ragdoll Escape 2D Physics Platformer Adventure"
          className="w-full h-full border-0 block"
          allow="autoplay; fullscreen"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
};
