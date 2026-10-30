import React, { useState, useMemo } from 'react';
import { Search, ArrowUpRight, Compass, Gamepad2, Wrench, Sparkles, Globe, Terminal, Activity, FlaskConical } from 'lucide-react';
import { Project, ProjectCategory } from '../types/project';
import { sounds } from '../utils/soundEffects';

interface ProjectShowcaseProps {
  projects: Project[];
  onOpenProject: (slug: string) => void;
}

type FilterCategory = 'All' | ProjectCategory;

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ projects, onOpenProject }) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: FilterCategory[] = ['All', 'Websites', 'Games', 'Tools', 'Experiments'];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.subtitle.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some((t) => t.toLowerCase().includes(query)) ||
        project.technologies.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Individual vibrant duotone theme definition per project
  const getProjectTheme = (slug: string) => {
    switch (slug) {
      case 'sandbox':
        return {
          gradient: 'from-[#2b1705] via-[#24131e] to-[#0c1224]',
          border: 'border-amber-500/50 hover:border-amber-400/90',
          badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          accentColor: '#f59e0b',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(245,158,11,0.35)]',
          iconBg: 'bg-amber-500/20 text-amber-300',
        };
      case 'ragdoll-escape':
        return {
          gradient: 'from-[#0a2318] via-[#0d2a23] to-[#08151f]',
          border: 'border-emerald-500/50 hover:border-lime-400/90',
          badgeBg: 'bg-emerald-950/80 text-lime-300 border-emerald-500/40',
          accentColor: '#34d399',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(52,211,153,0.35)]',
          iconBg: 'bg-emerald-500/20 text-lime-300',
        };
      case '3d-lemon-games':
        return {
          gradient: 'from-[#1a1133] via-[#211642] to-[#120e24]',
          border: 'border-purple-500/40 hover:border-yellow-400/80',
          badgeBg: 'bg-purple-950/80 text-yellow-300 border-purple-500/40',
          accentColor: '#facc15',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(168,85,247,0.3)]',
          iconBg: 'bg-purple-500/20 text-yellow-300',
        };
      case 'neon-dreams':
        return {
          gradient: 'from-[#2e0f24] via-[#1f112e] to-[#0c192c]',
          border: 'border-pink-500/40 hover:border-cyan-400/80',
          badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-500/40',
          accentColor: '#06b6d4',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(244,63,94,0.3)]',
          iconBg: 'bg-pink-500/20 text-cyan-300',
        };
      case 'cellular-automata-lab':
        return {
          gradient: 'from-[#0b241c] via-[#0b1f2b] to-[#09151f]',
          border: 'border-emerald-500/40 hover:border-teal-300/80',
          badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          accentColor: '#10b981',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)]',
          iconBg: 'bg-emerald-500/20 text-emerald-300',
        };
      case 'algorithmic-audio-synth':
        return {
          gradient: 'from-[#2b170e] via-[#29101d] to-[#140b17]',
          border: 'border-orange-500/40 hover:border-amber-300/80',
          badgeBg: 'bg-orange-950/80 text-amber-300 border-orange-500/40',
          accentColor: '#f97316',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(249,115,22,0.3)]',
          iconBg: 'bg-orange-500/20 text-amber-300',
        };
      case 'hyperminimal-reader':
        return {
          gradient: 'from-[#1c122b] via-[#1a1624] to-[#12111c]',
          border: 'border-purple-400/40 hover:border-purple-300/80',
          badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-400/40',
          accentColor: '#c084fc',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(192,132,252,0.3)]',
          iconBg: 'bg-purple-500/20 text-purple-300',
        };
      case 'neural-weight-sandbox':
      default:
        return {
          gradient: 'from-[#1c1033] via-[#0e212b] to-[#09141f]',
          border: 'border-violet-500/40 hover:border-teal-400/80',
          badgeBg: 'bg-violet-950/80 text-teal-300 border-violet-500/40',
          accentColor: '#14b8a6',
          glow: 'group-hover:shadow-[0_15px_40px_rgba(168,85,247,0.3)]',
          iconBg: 'bg-violet-500/20 text-teal-300',
        };
    }
  };

  const getCategoryIcon = (category: ProjectCategory) => {
    switch (category) {
      case 'Websites':
        return <Globe className="w-3.5 h-3.5 text-purple-300" />;
      case 'Games':
        return <Gamepad2 className="w-3.5 h-3.5 text-yellow-300" />;
      case 'Tools':
        return <Wrench className="w-3.5 h-3.5 text-orange-300" />;
      case 'Experiments':
        return <Sparkles className="w-3.5 h-3.5 text-pink-300" />;
    }
  };

  return (
    <section id="showcase" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/10 relative">
      {/* Background ambient pool */}
      <div className="absolute top-1/3 right-0 w-96 h-96 ambient-glow-lime pointer-events-none" />

      {/* Heading & Subheading */}
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs font-mono-code uppercase tracking-wider text-[#a3e635] font-bold block mb-2">
          ★ The Collection
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-white tracking-tight mb-3">
          Things I've Created.
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-xl">
          An artistic playground of software experiments, 3D spatial simulations, audio engines, and practical tools — each with its own visual soul.
        </p>
      </div>

      {/* Controls Bar: Category Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-12">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0f1124] border border-white/10">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? projects.length
                : projects.filter((p) => p.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  sounds.playBleep(650);
                  setSelectedCategory(cat);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/30 text-white' : 'text-slate-500 bg-white/5'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, tags, tools..."
            className="w-full pl-10 pr-12 py-2.5 bg-[#0f1124] border border-white/15 focus:border-[#a3e635] rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                sounds.playClick();
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-code text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-white/10"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Asymmetric Duotone Bento Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredProjects.map((project) => {
            const theme = getProjectTheme(project.slug);
            const isWide = project.gridSpan === 'wide';
            const isTall = project.gridSpan === 'tall';

            return (
              <div
                key={project.id}
                onClick={() => {
                  sounds.playChime();
                  onOpenProject(project.slug);
                }}
                className={`group relative rounded-3xl bg-gradient-to-br ${theme.gradient} border-2 ${theme.border} ${theme.glow} p-7 flex flex-col justify-between transition-all duration-400 hover:-translate-y-1.5 cursor-pointer overflow-hidden ${
                  isWide ? 'md:col-span-2' : ''
                } ${isTall ? 'lg:row-span-2' : ''}`}
              >
                {/* Decorative subtle ambient highlight */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors" />

                {/* Top Row: Category & Status */}
                <div>
                  <div className="flex items-center justify-between gap-3 text-xs font-mono-code mb-5">
                    <span className={`px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 ${theme.badgeBg}`}>
                      {getCategoryIcon(project.category)}
                      <span>{project.category}</span>
                    </span>

                    {/* Status indicator */}
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold ${
                        project.status === 'Live' ? 'text-[#a3e635]' : 'text-[#f59e0b]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          project.status === 'Live' ? 'bg-[#a3e635] animate-pulse' : 'bg-[#f59e0b]'
                        }`}
                      />
                      {project.status}
                    </span>
                  </div>

                  {/* Thumbnail / Creative Art Pattern */}
                  <div className="w-full h-40 rounded-2xl bg-black/40 border border-white/10 mb-6 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] to-transparent pointer-events-none" />

                    {/* Distinct vector art per project */}
                    {project.slug === 'sandbox' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-600/30 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                          <FlaskConical className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">20+ Alchemy Elements</div>
                          <div className="text-amber-300">Thermodynamics & Nitro Physics</div>
                        </div>
                      </div>
                    )}

                    {project.slug === 'ragdoll-escape' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border-2 border-lime-400/60 flex items-center justify-center text-lime-300 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                          <Gamepad2 className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">12 Worlds & Levels</div>
                          <div className="text-lime-300">Verlet Ragdoll Dynamics</div>
                        </div>
                      </div>
                    )}

                    {project.slug === '3d-lemon-games' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border-2 border-yellow-400/60 flex items-center justify-center text-yellow-300 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                          <Gamepad2 className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">4 Levels Included</div>
                          <div className="text-yellow-300">Procedural 3D Maze</div>
                        </div>
                      </div>
                    )}

                    {project.slug === 'neon-dreams' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-pink-600/30 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-lg">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">3D Perspective Grid</div>
                          <div className="text-pink-300">Cyberpunk Particles</div>
                        </div>
                      </div>
                    )}

                    {project.slug === 'cellular-automata-lab' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border-2 border-teal-300/60 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                          <Activity className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">Emergent Conway Rules</div>
                          <div className="text-emerald-300">Interactive Brushes</div>
                        </div>
                      </div>
                    )}

                    {project.slug === 'algorithmic-audio-synth' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-orange-600/30 border-2 border-amber-300/60 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-lg">
                          <Wrench className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">Web Audio Oscilloscope</div>
                          <div className="text-orange-300">Real Piano Roll</div>
                        </div>
                      </div>
                    )}

                    {project.slug === 'hyperminimal-reader' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border-2 border-purple-300/60 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                          <Globe className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">Focus Measure Math</div>
                          <div className="text-purple-300">Golden Ratio Typography</div>
                        </div>
                      </div>
                    )}

                    {project.slug === 'neural-weight-sandbox' && (
                      <div className="flex items-center gap-4 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-violet-600/30 border-2 border-teal-300/60 flex items-center justify-center text-teal-300 group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-lg">
                          <Terminal className="w-7 h-7" />
                        </div>
                        <div className="font-mono-code text-xs text-slate-300">
                          <div className="font-bold text-white">Decision Boundaries</div>
                          <div className="text-teal-300">Activation Function Sandbox</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-black font-display text-white mb-2 group-hover:text-white transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black flex items-center justify-center text-white transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </h3>

                  <p className="text-sm text-slate-300/90 leading-relaxed mb-5 font-normal line-clamp-2 min-h-[2.75rem]">
                    {project.description}
                  </p>
                </div>

                {/* Bottom Row: Tags & View CTA */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono-code px-2.5 py-0.5 rounded-md bg-black/40 border border-white/10 text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-white group-hover:underline whitespace-nowrap ml-2">
                    Open Demo &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center rounded-3xl bg-[#0f1124] border border-white/10 max-w-md mx-auto p-8 shadow-xl">
          <Compass className="w-12 h-12 text-[#a3e635] mx-auto mb-4 animate-bounce" />
          <h4 className="text-xl font-bold font-display text-white mb-1">
            No creations found
          </h4>
          <p className="text-sm text-slate-300 mb-6">
            No matches for "{searchQuery}" under category "{selectedCategory}".
          </p>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-white text-black hover:bg-[#a3e635] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
