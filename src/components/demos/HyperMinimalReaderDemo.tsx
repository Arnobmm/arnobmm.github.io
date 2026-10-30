import React, { useState } from 'react';
import { BookOpen, Type, AlignLeft, Eye } from 'lucide-react';

export const HyperMinimalReaderDemo: React.FC = () => {
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [lineHeight, setLineHeight] = useState<'snug' | 'relaxed' | 'loose'>('relaxed');
  const [isFocusMode, setIsFocusMode] = useState(false);

  const sampleText = `
# On Building Distinctive Digital Artifacts

The modern web is inundated with homogeny. Bootstrap grids gave way to Tailwind cards; corporate minimalism gave way to purple gradient bubbles. When software tools lower the friction of creation to zero, the default trajectory is aesthetic convergence.

True craft requires resisting the default.

### 1. Spatial Math & The Geometry of Restraint
When designing a canvas, what you omit is infinitely more consequential than what you decorate. Every additional badge, unfunctional icon, or pulsing status indicator dilutes the viewer's cognitive budget. 

### 2. The Return to Emergent Play
Software is at its most magical when it behaves like a physical toy. A particle that bounces. An oscillator that sings when you press a key. A cellular grid that breathes on its own through deterministic rules. 

When you build things with genuine curiosity, that enthusiasm vibrates through the glass.
  `.trim();

  const wordCount = sampleText.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 180);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getLineHeightClass = () => {
    switch (lineHeight) {
      case 'snug':
        return 'leading-normal';
      case 'loose':
        return 'leading-loose';
      default:
        return 'leading-relaxed';
    }
  };

  return (
    <div className={`w-full h-full flex flex-col justify-between p-6 transition-colors duration-500 rounded-xl ${
      isFocusMode ? 'bg-[#050507]' : 'bg-[#0d0d12]'
    }`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8 text-xs font-mono-code">
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">Size:</span>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                fontSize === s ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-neutral-400">
          <span>{wordCount} words</span>
          <span aria-hidden="true">&bull;</span>
          <span>~{readTime} min read</span>
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`px-3 py-1 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
              isFocusMode
                ? 'bg-[#a3e635] text-black border-[#a3e635] font-bold'
                : 'border-white/10 hover:border-white/30 text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>
        </div>
      </div>

      {/* Reader Prose Pane */}
      <div className="my-6 max-w-xl mx-auto overflow-y-auto max-h-[380px] pr-3 select-text">
        <div className={`${getFontSizeClass()} ${getLineHeightClass()} text-neutral-200 space-y-4 font-normal`}>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-4">
            On Building Distinctive Digital Artifacts
          </h2>
          <p className="text-neutral-300">
            The modern web is inundated with homogeny. Corporate minimalism gave way to purple gradient bubbles and template slop. When software tools lower the friction of creation to zero, the default trajectory is aesthetic convergence.
          </p>
          <p className="text-[#a3e635] font-semibold italic border-l-2 border-[#a3e635] pl-4 my-4">
            "True craft requires resisting the default."
          </p>
          <h3 className="text-xl font-bold font-display text-white pt-2">
            1. Spatial Math & The Geometry of Restraint
          </h3>
          <p className="text-neutral-300">
            When designing an interface, what you omit is infinitely more consequential than what you decorate. Every additional badge, unfunctional icon, or pulsing status indicator dilutes the viewer's cognitive budget.
          </p>
          <h3 className="text-xl font-bold font-display text-white pt-2">
            2. The Return to Emergent Play
          </h3>
          <p className="text-neutral-300">
            Software is at its most magical when it behaves like a physical toy. A particle that bounces. An oscillator that sings when you press a key. A cellular grid that breathes on its own through deterministic rules.
          </p>
        </div>
      </div>

      <div className="text-[11px] font-mono-code text-neutral-500 text-center pt-2 border-t border-white/5">
        HyperMinimal Reader Engine &bull; Pure typography &bull; Distraction-free measure
      </div>
    </div>
  );
};
