import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';

interface InteractiveStickerProps {
  label: string;
  emoji?: string;
  rotation?: string;
  colorScheme?: 'lime' | 'violet' | 'coral' | 'cyan' | 'lemon';
  className?: string;
}

export const InteractiveSticker: React.FC<InteractiveStickerProps> = ({
  label,
  emoji,
  rotation = '-rotate-3',
  colorScheme = 'lime',
  className = '',
}) => {
  const [isPopped, setIsPopped] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopped(true);
    setClickCount((prev) => prev + 1);
    sounds.playPop();

    setTimeout(() => {
      setIsPopped(false);
    }, 400);
  };

  const getColors = () => {
    switch (colorScheme) {
      case 'violet':
        return 'bg-[#8b5cf6] text-white border-2 border-white shadow-[0_6px_0_#5b21b6]';
      case 'coral':
        return 'bg-[#f43f5e] text-white border-2 border-white shadow-[0_6px_0_#9f1239]';
      case 'cyan':
        return 'bg-[#06b6d4] text-black border-2 border-white shadow-[0_6px_0_#0e7490]';
      case 'lemon':
        return 'bg-[#facc15] text-black border-2 border-white shadow-[0_6px_0_#a16207]';
      case 'lime':
      default:
        return 'bg-[#a3e635] text-black border-2 border-white shadow-[0_6px_0_#4d7c0f]';
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-extrabold text-xs tracking-wider uppercase select-none transition-transform duration-150 cursor-pointer active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.5)] ${rotation} ${getColors()} ${
        isPopped ? 'animate-sticker-pop' : 'hover:scale-105'
      } ${className}`}
      title="Click me!"
    >
      {emoji && <span className="text-sm">{emoji}</span>}
      <span>{label}</span>
      {clickCount > 0 && (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 text-white font-mono-code ml-0.5">
          {clickCount}
        </span>
      )}
    </button>
  );
};
