import React, { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Calendar, Tag, CheckCircle2, Cpu } from 'lucide-react';
import { Project } from '../types/project';
import { CellularAutomataDemo } from './demos/CellularAutomataDemo';
import { AudioSynthDemo } from './demos/AudioSynthDemo';
import { HyperMinimalReaderDemo } from './demos/HyperMinimalReaderDemo';
import { NeuralSandboxDemo } from './demos/NeuralSandboxDemo';
import { ProjectTwo } from './ProjectTwo';
import { ProjectOne } from './ProjectOne';
import { SandboxWorkspace } from './sandbox/SandboxWorkspace';
import { RagdollEscapeDemo } from './demos/RagdollEscapeDemo';
import { InteractiveSticker } from './InteractiveSticker';
import { sounds } from '../utils/soundEffects';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onSelectProject: (slug: string) => void;
  allProjects: Project[];
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onSelectProject,
  allProjects,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [project.slug]);

  const currentIndex = allProjects.findIndex((p) => p.slug === project.slug);
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];

  const getAccentGradient = (color: Project['accentColor']) => {
    switch (color) {
      case 'violet':
        return 'from-purple-500/20 via-transparent to-transparent border-purple-500/30';
      case 'lime':
        return 'from-lime-500/20 via-transparent to-transparent border-lime-500/30';
      case 'cyan':
        return 'from-cyan-500/20 via-transparent to-transparent border-cyan-500/30';
      case 'orange':
      default:
        return 'from-orange-500/20 via-transparent to-transparent border-orange-500/30';
    }
  };

  const renderInteractiveDemo = () => {
    switch (project.demoType) {
      case 'ragdoll-escape':
        return <RagdollEscapeDemo onBack={onBack} />;
      case 'sandbox-alchemy':
        return (
          <div className="w-full h-[680px] rounded-3xl overflow-hidden relative border-2 border-amber-500/30 shadow-[0_20px_60px_rgba(245,158,11,0.25)]">
            <SandboxWorkspace />
          </div>
        );
      case 'threejs-game':
        return (
          <div className="w-full h-[640px] rounded-3xl overflow-hidden relative border-2 border-purple-500/30 shadow-[0_20px_60px_rgba(139,92,246,0.25)]">
            <ProjectTwo onBackToPortfolio={onBack} />
          </div>
        );
      case 'neon-dreams':
        return (
          <div className="w-full h-[640px] rounded-3xl overflow-hidden relative border-2 border-pink-500/30 shadow-[0_20px_60px_rgba(244,63,94,0.25)]">
            <ProjectOne onBack={onBack} />
          </div>
        );
      case 'cellular-automata':
        return (
          <div className="w-full h-[600px] rounded-3xl overflow-hidden relative border-2 border-emerald-500/30 shadow-[0_20px_60px_rgba(16,185,129,0.25)]">
            <CellularAutomataDemo />
          </div>
        );
      case 'audio-synth':
        return (
          <div className="w-full h-[560px] rounded-3xl overflow-hidden relative border-2 border-orange-500/30 shadow-[0_20px_60px_rgba(249,115,22,0.25)]">
            <AudioSynthDemo />
          </div>
        );
      case 'markdown-reader':
        return (
          <div className="w-full h-[560px] rounded-3xl overflow-hidden relative border-2 border-purple-400/30 shadow-[0_20px_60px_rgba(192,132,252,0.25)]">
            <HyperMinimalReaderDemo />
          </div>
        );
      case 'neural-network':
        return (
          <div className="w-full h-[560px] rounded-3xl overflow-hidden relative border-2 border-violet-500/30 shadow-[0_20px_60px_rgba(168,85,247,0.25)]">
            <NeuralSandboxDemo />
          </div>
        );
      default:
        return (
          <div className="w-full h-80 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center text-slate-400">
            Interactive demo ready
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#090a16] text-[#f8fafc]">
      {/* Top Breadcrumb & Navigation */}
      <div className="sticky top-0 z-40 bg-[#090a16]/95 backdrop-blur-md border-b border-white/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playBleep(600);
              onBack();
            }}
            className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#a3e635] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Showcase</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400">
            <span>ARNOB</span>
            <span aria-hidden="true">/</span>
            <span>{project.category}</span>
            <span aria-hidden="true">/</span>
            <span className="text-white font-bold">{project.slug}</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Project Header Info */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono-code text-slate-300">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 font-bold text-white">
              {project.category}
            </span>
            <span aria-hidden="true">&bull;</span>
            <span className="flex items-center gap-1.5 text-[#a3e635] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
              {project.status}
            </span>
            <span aria-hidden="true">&bull;</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {project.completionDate}
            </span>
            <InteractiveSticker label="Interactive Engine" emoji="⚡" colorScheme="lemon" rotation="rotate-2" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display text-white tracking-tight">
            {project.title}
          </h1>

          <p className="text-lg sm:text-2xl text-slate-200 font-semibold max-w-3xl leading-relaxed">
            {project.subtitle}
          </p>
        </div>

        {/* Embedded Interactive Live Demo Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-3 text-xs font-mono-code text-slate-300">
            <span className="flex items-center gap-2 text-[#a3e635] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-ping" />
              <span>Embedded Live Interactive Canvas</span>
            </span>
            <span className="text-slate-400">Direct playable viewport</span>
          </div>

          {/* Interactive Demo Viewport */}
          <div className="relative rounded-3xl overflow-hidden">
            {renderInteractiveDemo()}
          </div>
        </section>

        {/* Details Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
          {/* Left Column: Purpose & Deep Description (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Description & Purpose */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                Concept & Background
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                {project.longDescription}
              </p>
            </section>

            {/* Core Features */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                Feature Highlights
              </h2>
              <ul className="space-y-3">
                {project.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-[#a3e635] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right Column: Tech Stack & Metadata (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Technologies Used Card */}
            <div className="p-7 rounded-3xl bg-[#0f1124] border-2 border-white/10 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#06b6d4]" />
                <span>Technologies & Frameworks</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-mono-code text-slate-100 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags & Categories Card */}
            <div className="p-7 rounded-3xl bg-[#0f1124] border-2 border-white/10 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#a855f7]" />
                <span>Domain Focus</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300 text-xs font-mono-code"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-[#16122d] to-[#0f1124] border-2 border-purple-500/30 space-y-3 shadow-xl">
              <div className="text-xs font-mono-code text-slate-300">
                Explore More Creations
              </div>
              <button
                onClick={() => {
                  sounds.playBleep(650);
                  onBack();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-[#a3e635] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Browse All Projects</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Next Project Teaser */}
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <button
            onClick={() => {
              sounds.playBleep(600);
              onBack();
            }}
            className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Showcase</span>
          </button>

          {nextProject && (
            <button
              onClick={() => {
                sounds.playChime();
                onSelectProject(nextProject.slug);
              }}
              className="group text-right cursor-pointer"
            >
              <div className="text-xs font-mono-code text-slate-400 mb-1">
                Next Creation &rarr;
              </div>
              <div className="text-xl font-black font-display text-white group-hover:text-[#a3e635] transition-colors flex items-center gap-2">
                <span>{nextProject.title}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
