import React from 'react';
import { ArrowDown, Compass, Sparkles, Wand2 } from 'lucide-react';
import { HeroEmojiScene } from './HeroEmojiScene';
import { InteractiveSticker } from './InteractiveSticker';
import { sounds } from '../utils/soundEffects';

interface HeroProps {
  onExploreProjects: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProjects }) => {
  const handleExploreClick = () => {
    sounds.playChime();
    onExploreProjects();
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-6 overflow-hidden border-b border-white/8 bg-[#090a16]">
      {/* Ambient colorful light pools */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full ambient-glow-purple pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full ambient-glow-coral pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full ambient-glow-cyan pointer-events-none opacity-40" />

      {/* Floating 3D Emoji Universe Canvas */}
      <HeroEmojiScene />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center pointer-events-none py-12">
        {/* Playful Stickers Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 pointer-events-auto">
          <InteractiveSticker
            label="Digital Playground"
            emoji="✨"
            colorScheme="violet"
            rotation="-rotate-2"
          />
          <InteractiveSticker
            label="100% Handcrafted"
            emoji="⚡"
            colorScheme="lemon"
            rotation="rotate-3"
          />
          <InteractiveSticker
            label="Interactive 3D"
            emoji="🎮"
            colorScheme="cyan"
            rotation="-rotate-3"
          />
        </div>

        {/* Primary Heading */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display tracking-tight text-white mb-6 leading-[1.02] text-balance">
          Hey, I'm <span className="text-[#a3e635] drop-shadow-[0_0_35px_rgba(163,230,53,0.4)]">Arnob</span>.
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 mb-6 max-w-2xl leading-snug font-display text-balance">
          I build things, explore ideas, and turn <span className="text-[#f43f5e]">curiosity</span> into <span className="text-[#06b6d4]">projects</span>.
        </p>

        {/* Welcoming introduction */}
        <p className="text-base sm:text-lg text-slate-300 max-w-xl mb-10 leading-relaxed font-normal">
          Welcome to my personal digital corner — an experimental studio where code, 3D spatial geometry, interactive physics, and playful design collide.
        </p>

        {/* Explore Button & Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
          <button
            onClick={handleExploreClick}
            className="px-8 py-4 rounded-2xl bg-white text-black font-extrabold text-sm tracking-wide hover:bg-[#a3e635] hover:shadow-[0_0_35px_rgba(163,230,53,0.45)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex items-center gap-2 shadow-xl"
          >
            <Compass className="w-4 h-4 text-black" />
            <span>Explore Creations</span>
          </button>
          
          <a
            href="#about"
            onClick={() => sounds.playBleep(520)}
            className="px-7 py-4 rounded-2xl bg-[#161933] hover:bg-[#202447] border border-white/15 text-sm font-bold text-white transition-all cursor-pointer shadow-lg hover:border-white/30"
          >
            About Me
          </a>
        </div>
      </div>

      {/* Playful Scroll Indicator */}
      <button
        onClick={handleExploreClick}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 hover:text-[#a3e635] transition-colors pointer-events-auto cursor-pointer group"
        aria-label="Scroll down to featured project"
      >
        <span className="text-[11px] font-mono-code uppercase tracking-widest group-hover:tracking-wider transition-all font-bold">
          Dive In
        </span>
        <ArrowDown className="w-4 h-4 animate-bounce text-[#a3e635]" />
      </button>
    </section>
  );
};
