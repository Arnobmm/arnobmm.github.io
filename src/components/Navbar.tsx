import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface NavbarProps {
  onNavigateHome: () => void;
  onOpenSandbox?: () => void;
  isDetailPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onOpenSandbox, isDetailPage = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sounds.enabled = newState;
    if (newState) {
      sounds.playPop();
    }
  };

  const handleNavClick = (anchorId: string) => {
    sounds.playBleep(600);
    setMobileMenuOpen(false);
    if (isDetailPage) {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090a16]/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => {
            sounds.playBleep(700);
            onNavigateHome();
          }}
          className="text-2xl font-black font-display tracking-widest text-white hover:text-[#a3e635] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 group"
        >
          <span className="group-hover:scale-105 transition-transform">ARNOB</span>
          <span className="w-2 h-2 rounded-full bg-[#a3e635] group-hover:scale-125 transition-transform" />
          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono-code text-[#a855f7] bg-purple-900/30 border border-purple-500/30 hidden sm:inline-block">
            creative universe
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <button
            onClick={() => {
              if (onOpenSandbox) {
                sounds.playChime();
                onOpenSandbox();
              } else {
                handleNavClick('featured');
              }
            }}
            className="text-amber-400 hover:text-amber-300 font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Sandbox</span>
          </button>
          <button
            onClick={() => handleNavClick('featured')}
            className="hover:text-[#a855f7] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Featured
          </button>
          <button
            onClick={() => handleNavClick('showcase')}
            className="hover:text-[#a3e635] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Showcase
          </button>
          <button
            onClick={() => handleNavClick('exploring')}
            className="hover:text-[#06b6d4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Exploring
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="hover:text-[#f43f5e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="hover:text-[#facc15] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Primary Action & Easter Egg Sound Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-mono-code transition-all flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-[#a3e635]/15 border-[#a3e635]/50 text-[#a3e635] shadow-[0_0_12px_rgba(163,230,53,0.25)]'
                : 'bg-white/5 border-white/10 text-neutral-500 hover:text-white'
            }`}
            title={soundEnabled ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted (Click to Enable)'}
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden lg:inline text-[11px] font-bold">
              {soundEnabled ? 'SFX ON' : 'SFX OFF'}
            </span>
          </button>

          <button
            onClick={() => handleNavClick('showcase')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white text-black hover:bg-[#a3e635] hover:shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all duration-200 whitespace-nowrap cursor-pointer"
          >
            <span>Explore Works</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0f1e] border-b border-white/10 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3 text-base font-semibold">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSandbox) {
                  sounds.playChime();
                  onOpenSandbox();
                } else {
                  handleNavClick('featured');
                }
              }}
              className="text-left py-2 text-amber-400 font-bold flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Sandbox: Powder Alchemy</span>
            </button>
            <button
              onClick={() => handleNavClick('featured')}
              className="text-left py-2 text-slate-300 hover:text-[#a855f7]"
            >
              Featured Project
            </button>
            <button
              onClick={() => handleNavClick('showcase')}
              className="text-left py-2 text-slate-300 hover:text-[#a3e635]"
            >
              Project Showcase
            </button>
            <button
              onClick={() => handleNavClick('exploring')}
              className="text-left py-2 text-slate-300 hover:text-[#06b6d4]"
            >
              Currently Exploring
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-2 text-slate-300 hover:text-[#f43f5e]"
            >
              About Arnob
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left py-2 text-slate-300 hover:text-[#facc15]"
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
