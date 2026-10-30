import React, { useState } from 'react';
import { ArrowLeft, Play, Shield, Compass, Flame, Box } from 'lucide-react';
import { MazeGame } from './games/MazeGame';
import { ParkourGame } from './games/ParkourGame';

interface ProjectTwoProps {
  onBackToPortfolio: () => void;
}

export const ProjectTwo: React.FC<ProjectTwoProps> = ({ onBackToPortfolio }) => {
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  if (activeLevel === 1) {
    return <MazeGame onBackToLevels={() => setActiveLevel(null)} />;
  }

  if (activeLevel === 2 || activeLevel === 3 || activeLevel === 4) {
    return (
      <ParkourGame
        level={activeLevel as 2 | 3 | 4}
        onBackToLevels={() => setActiveLevel(null)}
      />
    );
  }

  const levels = [
    {
      id: 1,
      title: 'Level 1',
      subtitle: 'Standard Maze',
      difficulty: 'Easy',
      diffColor: 'text-green-400',
      icon: Compass,
      desc: 'First-person procedurally generated 3D maze with radar minimap and landmarks.',
    },
    {
      id: 2,
      title: 'Level 2',
      subtitle: 'Parkour in Sky',
      difficulty: 'Medium',
      diffColor: 'text-yellow-400',
      icon: Play,
      desc: 'Sky-high spiral parkour featuring donut, cloud, star, and floating crystal platforms.',
    },
    {
      id: 3,
      title: 'Level 3',
      subtitle: 'Parkour in Lava',
      difficulty: 'Hard',
      diffColor: 'text-red-400',
      icon: Flame,
      desc: 'Intense lava platforming with magma glow, moving blocks, and challenging gaps.',
    },
    {
      id: 4,
      title: 'Level 4',
      subtitle: 'Minecraft Parkour',
      difficulty: 'Hard',
      diffColor: 'text-orange-400',
      icon: Box,
      desc: 'Minecraft blocks theme: grass, obsidian, slime blocks, and Diamond goal block.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 relative font-sans selection:bg-purple-600 selection:text-white">
      {/* Back button */}
      <button
        onClick={onBackToPortfolio}
        className="absolute top-6 left-6 z-20 flex items-center space-x-2 px-4 py-2 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 text-white text-sm transition-all duration-300 cursor-pointer shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Portfolio</span>
      </button>

      {/* Main Title with purple glow matching original */}
      <div className="text-center mb-12">
        <h1
          className="text-4xl sm:text-6xl font-black tracking-wide mb-3"
          style={{ textShadow: '0 0 10px #6a0dad, 0 0 25px #6a0dad, 0 0 40px #6a0dad' }}
        >
          3D Lemon Games
        </h1>
        <p className="text-neutral-400 text-base sm:text-lg font-['Quicksand']">
          Select a level to launch the interactive 3D WebGL engine
        </p>
      </div>

      {/* 2x2 Levels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {levels.map((lvl) => {
          const Icon = lvl.icon;
          return (
            <div
              key={lvl.id}
              onClick={() => setActiveLevel(lvl.id)}
              className="bg-[#6a0dad]/30 hover:bg-[#6a0dad]/60 border-2 border-[#6a0dad] hover:border-white rounded-2xl p-6 text-center transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg flex flex-col items-center justify-between group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{lvl.title}</h2>
                <p className="text-lg text-neutral-200 font-semibold mb-2">{lvl.subtitle}</p>
                <p className="text-xs text-neutral-300 mb-3 line-clamp-2">{lvl.desc}</p>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-black/40 border border-white/10">
                Difficulty: <span className={lvl.diffColor}>{lvl.difficulty}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom controls tip */}
      <div className="mt-12 text-center text-xs text-neutral-400 max-w-md">
        <p>Controls: WASD to move &bull; Mouse look &bull; Space to jump &bull; Shift to sprint &bull; R to Fly &bull; E/F for Speed</p>
      </div>
    </div>
  );
};
