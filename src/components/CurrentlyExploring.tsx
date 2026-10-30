import React from 'react';
import { Cpu, Brain, Boxes, Activity, Radio } from 'lucide-react';
import { EXPLORATION_TOPICS } from '../data/projects';
import { InteractiveSticker } from './InteractiveSticker';
import { sounds } from '../utils/soundEffects';

export const CurrentlyExploring: React.FC = () => {
  const getTopicVisuals = (id: string) => {
    switch (id) {
      case 'prog-systems':
        return {
          icon: <Cpu className="w-6 h-6 text-[#06b6d4]" />,
          border: 'border-cyan-500/30 hover:border-cyan-400/70',
          gradient: 'from-[#0a1829] to-[#0c1224]',
          tagColor: 'text-cyan-300 border-cyan-500/30',
        };
      case 'gen-ai':
        return {
          icon: <Brain className="w-6 h-6 text-[#c084fc]" />,
          border: 'border-purple-500/30 hover:border-purple-400/70',
          gradient: 'from-[#190e2b] to-[#0f1124]',
          tagColor: 'text-purple-300 border-purple-500/30',
        };
      case 'game-dev':
        return {
          icon: <Boxes className="w-6 h-6 text-[#a3e635]" />,
          border: 'border-lime-500/30 hover:border-lime-400/70',
          gradient: 'from-[#14230d] to-[#0d151e]',
          tagColor: 'text-lime-300 border-lime-500/30',
        };
      case 'simulations':
        return {
          icon: <Activity className="w-6 h-6 text-[#f43f5e]" />,
          border: 'border-rose-500/30 hover:border-rose-400/70',
          gradient: 'from-[#290e18] to-[#121124]',
          tagColor: 'text-rose-300 border-rose-500/30',
        };
      case 'audio-dsp':
      default:
        return {
          icon: <Radio className="w-6 h-6 text-[#f59e0b]" />,
          border: 'border-amber-500/30 hover:border-amber-400/70',
          gradient: 'from-[#24170b] to-[#111124]',
          tagColor: 'text-amber-300 border-amber-500/30',
        };
    }
  };

  return (
    <section id="exploring" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/10 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 ambient-glow-cyan pointer-events-none" />

      {/* Section Header */}
      <div className="mb-14 text-center sm:text-left flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#06b6d4] font-bold">
              ★ Active Headspace
            </span>
            <InteractiveSticker label="Research" emoji="🔬" colorScheme="cyan" rotation="-rotate-2" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-white tracking-tight">
            Currently Exploring.
          </h2>
        </div>
        <p className="text-slate-300 text-base max-w-md">
          Deep-dives into systems architecture, emerging machine learning, WebGL shaders, and complexity science.
        </p>
      </div>

      {/* Topics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXPLORATION_TOPICS.map((topic, idx) => {
          const visuals = getTopicVisuals(topic.id);
          const isWide = idx === 0;

          return (
            <div
              key={topic.id}
              onClick={() => sounds.playBleep(540 + idx * 40)}
              className={`p-8 rounded-3xl bg-gradient-to-br ${visuals.gradient} border-2 ${visuals.border} transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between group cursor-pointer ${
                isWide ? 'lg:col-span-2' : ''
              }`}
            >
              <div>
                {/* Header: Icon + Topic Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-md">
                    {visuals.icon}
                  </div>
                  <span className="text-xs font-mono-code font-bold text-slate-400 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
                    Topic #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black font-display text-white mb-2 group-hover:text-white transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs font-mono-code font-bold text-slate-400 mb-4">
                  {topic.subtitle}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  {topic.description}
                </p>
              </div>

              {/* Current Focus Highlight */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
                    <span>Active Inquiry</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-ping" />
                  </div>
                  <div className="text-xs text-white font-medium">
                    {topic.currentFocus}
                  </div>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs font-mono-code px-2.5 py-0.5 rounded-md bg-black/40 border font-medium ${visuals.tagColor}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
