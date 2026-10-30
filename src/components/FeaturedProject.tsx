import React from 'react';
import { ArrowUpRight, Play, Sparkles, Gamepad2 } from 'lucide-react';
import { Project } from '../types/project';
import { InteractiveSticker } from './InteractiveSticker';
import { sounds } from '../utils/soundEffects';

interface FeaturedProjectProps {
  project: Project;
  onOpenProject: (slug: string) => void;
}

export const FeaturedProject: React.FC<FeaturedProjectProps> = ({ project, onOpenProject }) => {
  const handleOpen = () => {
    sounds.playChime();
    onOpenProject(project.slug);
  };

  return (
    <section id="featured" className="py-24 px-6 max-w-6xl mx-auto relative">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#a855f7] font-bold">
              ★ Hand-Picked Highlight
            </span>
            <InteractiveSticker label="Playable" emoji="🎮" colorScheme="lemon" rotation="rotate-2" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white">
            Featured Creation
          </h2>
        </div>
        <div className="text-xs font-mono-code text-slate-400">
          Click card or button to launch
        </div>
      </div>

      {/* Visually Dominant Duotone Showcase Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#16122d] via-[#10132b] to-[#0c0d1c] border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 overflow-hidden group shadow-[0_25px_60px_rgba(139,92,246,0.18)]">
        {/* Dynamic colored background blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/35 transition-colors duration-700" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-colors duration-700" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 relative z-10">
          {/* Left Column: Metadata & Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Unboxed category and live status metadata */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono-code text-slate-300">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                {project.category}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-[#a3e635] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
                {project.status}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{project.completionDate}</span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h3 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight mb-2 group-hover:text-[#c084fc] transition-colors">
                {project.title}
              </h3>
              <p className="text-lg text-slate-200 font-semibold">
                {project.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              {project.description}
            </p>

            {/* Key Technologies */}
            <div className="flex flex-wrap gap-2 pt-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-mono-code text-slate-200 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={handleOpen}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#ec4899] hover:from-[#fbbf24] hover:to-[#f43f5e] text-white font-extrabold text-sm tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{project.id === 'sandbox' ? 'Launch Powder Alchemy Simulator' : 'Launch Interactive 3D Game'}</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Arcade Teaser Preview (5 cols) */}
          <div
            onClick={handleOpen}
            className="lg:col-span-5 relative rounded-2xl overflow-hidden bg-[#090b17] border-2 border-amber-500/40 h-72 sm:h-96 flex flex-col justify-between p-6 cursor-pointer group/preview hover:border-amber-400/70 transition-all duration-300 shadow-2xl"
          >
            {project.id === 'sandbox' ? (
              /* Sandbox Particle Alchemy Visual */
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.25)_0%,_rgba(12,13,28,0.95)_75%)] pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="relative w-52 h-52 border-2 border-amber-400/40 rounded-3xl p-4 flex flex-col justify-end bg-black/40 backdrop-blur-sm group-hover/preview:scale-105 transition-transform duration-500">
                  <div className="w-full h-12 bg-gradient-to-r from-blue-500/60 to-cyan-400/60 rounded-xl mb-1 flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">H₂O Water Layer</span>
                  </div>
                  <div className="w-full h-10 bg-gradient-to-r from-amber-600/70 to-yellow-500/70 rounded-xl mb-1 flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">Oil (Density 0.8)</span>
                  </div>
                  <div className="w-full h-8 bg-gradient-to-r from-orange-600/80 to-red-600/80 rounded-xl flex items-center justify-center animate-pulse">
                    <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">Lava (1200°C)</span>
                  </div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
                    <span className="text-xs font-mono font-bold text-amber-200">20+ Elements</span>
                  </div>
                </div>
              </div>
            ) : (
              /* 3D Wireframe Scene Simulation */
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.3)_0%,_rgba(12,13,28,0.95)_75%)] pointer-events-none flex items-center justify-center">
                <div className="relative w-48 h-48 border-2 border-dashed border-purple-400/50 rounded-3xl rotate-12 group-hover/preview:rotate-45 group-hover/preview:scale-110 transition-all duration-700 flex items-center justify-center">
                  <div className="w-28 h-28 border-2 border-yellow-400/50 rounded-2xl -rotate-24 group-hover/preview:rotate-12 transition-all duration-500 flex items-center justify-center bg-purple-950/40 backdrop-blur-sm">
                    <Gamepad2 className="w-12 h-12 text-yellow-300 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Top Badge overlay */}
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-xs font-mono-code font-bold px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/40 text-amber-300 shadow-md">
                {project.id === 'sandbox' ? 'Physics & Chemistry Engine' : '3D WebGL Engine'}
              </span>
              <span className="w-9 h-9 rounded-full bg-white/10 group-hover/preview:bg-[#f59e0b] group-hover/preview:text-black flex items-center justify-center text-white transition-all shadow-md">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            {/* Bottom preview summary */}
            <div className="relative z-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/15 space-y-1">
              <div className="text-xs font-bold text-white font-display flex items-center justify-between">
                <span>{project.id === 'sandbox' ? 'Pure Open Sandbox' : '4 Playable Environments'}</span>
                <span className="text-[#a3e635] text-[10px] font-mono-code">READY</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono-code">
                {project.id === 'sandbox'
                  ? 'Thermodynamics · Explosions · Life Growth · Fluid Flow'
                  : 'Procedural Maze · Sky · Lava · Minecraft Parkour'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
