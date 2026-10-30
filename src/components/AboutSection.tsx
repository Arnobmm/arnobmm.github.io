import React from 'react';
import { Terminal, Lightbulb, Code2, Sparkles, Heart } from 'lucide-react';
import { InteractiveSticker } from './InteractiveSticker';
import { sounds } from '../utils/soundEffects';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/10 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 right-0 w-80 h-80 ambient-glow-purple pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading and narrative (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#a3e635] font-bold">
              ★ The Human Behind The Code
            </span>
            <InteractiveSticker label="Curiosity First" emoji="💡" colorScheme="lime" rotation="rotate-3" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-white tracking-tight leading-tight">
            Software as a canvas for play.
          </h2>

          <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            <p>
              I'm <strong className="text-white font-bold">Arnob</strong>, an independent developer and creative explorer. I believe the web is at its best when it feels like a physical playground — responsive, tactile, surprising, and handcrafted.
            </p>
            <p>
              Rather than building cookie-cutter dashboards or following safe design templates, I use software to investigate whatever captures my curiosity: from algorithmic 3D mazes in WebGL to emergent Conway cellular systems and polyphonic audio synthesizers.
            </p>
            <p className="text-slate-400 text-base">
              My goal with this website is simple: to share a personal, colorful corner of the internet where friends and fellow creators can tinker, play, and discover that code can still be wonderfully fun.
            </p>
          </div>
        </div>

        {/* Right Column: Values & Quick Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onClick={() => sounds.playBleep(520)}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#16122d] to-[#0f1124] border-2 border-purple-500/30 hover:border-purple-400/70 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white font-display">Craft Over Cliché</h4>
              </div>
              <span className="text-xs font-mono-code text-purple-400">01</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal pl-13">
              Understanding how bits, pixels, and physics engines work from the ground up rather than relying on bloated libraries.
            </p>
          </div>

          <div
            onClick={() => sounds.playBleep(580)}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#1b1c10] to-[#0e161a] border-2 border-lime-500/30 hover:border-lime-400/70 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-300 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white font-display">Tangible Immersion</h4>
              </div>
              <span className="text-xs font-mono-code text-lime-400">02</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal pl-13">
              Giving every interface weight, tactile feedback, sound cues, and reactive geometry that rewards user exploration.
            </p>
          </div>

          <div
            onClick={() => sounds.playBleep(640)}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#1b1226] to-[#0e1b24] border-2 border-rose-500/30 hover:border-rose-400/70 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                  <Terminal className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white font-display">Open Curiosity</h4>
              </div>
              <span className="text-xs font-mono-code text-rose-400">03</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal pl-13">
              Sharing code, interactive sandboxes, and learnings openly with fellow makers and curious minds worldwide.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
