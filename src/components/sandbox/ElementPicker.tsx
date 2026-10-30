import React, { useState } from 'react';
import { ElementType, ELEMENT_DEFS } from './PowderAlchemyCore';
import { sounds } from '../../utils/soundEffects';

interface ElementPickerProps {
  selectedElement: ElementType;
  onSelectElement: (type: ElementType) => void;
  className?: string;
}

type CategoryTab = 'all' | 'solids' | 'liquids' | 'gases' | 'life' | 'tools';

export const ElementPicker: React.FC<ElementPickerProps> = ({
  selectedElement,
  onSelectElement,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');

  const allElements = [
    // Solids
    ElementType.SAND,
    ElementType.DIRT,
    ElementType.STONE,
    ElementType.WOOD,
    ElementType.GLASS,
    ElementType.METAL,
    ElementType.ICE,
    ElementType.SPONGE,
    ElementType.WALL,
    // Liquids
    ElementType.WATER,
    ElementType.OIL,
    ElementType.ACID,
    ElementType.LAVA,
    ElementType.NITRO,
    // Gases
    ElementType.FIRE,
    ElementType.SMOKE,
    ElementType.STEAM,
    ElementType.GAS,
    // Life
    ElementType.SEED,
    ElementType.PLANT,
    ElementType.SPORE,
  ];

  const filteredElements = allElements.filter((id) => {
    if (activeTab === 'all') return true;
    const def = ELEMENT_DEFS[id];
    return def && def.category === activeTab;
  });

  const getElementColorRgb = (type: ElementType): string => {
    if (type === ElementType.ERASER) return 'rgb(244, 63, 94)';
    const def = ELEMENT_DEFS[type];
    if (!def) return 'rgb(150, 150, 150)';
    return `rgb(${def.color[0]}, ${def.color[1]}, ${def.color[2]})`;
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'solids', label: 'Solids' },
            { id: 'liquids', label: 'Liquids' },
            { id: 'gases', label: 'Gases' },
            { id: 'life', label: 'Life' },
            { id: 'tools', label: 'Tools' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.bleep();
                setActiveTab(tab.id);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
                isActive
                  ? 'bg-white text-black shadow-md shadow-white/10'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Element Buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-11 gap-2">
        {/* Special Eraser Tool */}
        {(activeTab === 'all' || activeTab === 'tools') && (
          <button
            onClick={() => {
              sounds.pop();
              onSelectElement(ElementType.ERASER);
            }}
            className={`min-h-[48px] min-w-[48px] p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
              selectedElement === ElementType.ERASER
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-400/50 scale-105'
                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full border border-rose-400 bg-rose-500/40" />
            <span className="text-[11px] font-medium leading-none">Eraser</span>
          </button>
        )}

        {filteredElements.map((type) => {
          const def = ELEMENT_DEFS[type];
          if (!def) return null;
          const isSelected = selectedElement === type;
          const colorRgb = getElementColorRgb(type);

          return (
            <button
              key={type}
              onClick={() => {
                sounds.pop();
                onSelectElement(type);
              }}
              title={def.description}
              className={`min-h-[48px] min-w-[48px] p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 border transition-all ${
                isSelected
                  ? 'bg-white/15 border-white/60 text-white shadow-lg ring-2 ring-white/30 scale-105'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/25'
              }`}
            >
              {/* Elemental color swatch */}
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-white/20 transition-transform"
                style={{
                  backgroundColor: colorRgb,
                  boxShadow: isSelected ? `0 0 10px ${colorRgb}` : 'none',
                }}
              />
              <span className="text-[11px] font-medium leading-none whitespace-nowrap truncate max-w-[56px]">
                {def.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Element Info Callout */}
      {selectedElement !== ElementType.ERASER && ELEMENT_DEFS[selectedElement] && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: getElementColorRgb(selectedElement) }}
            />
            <span className="font-semibold text-white">{ELEMENT_DEFS[selectedElement].name}:</span>
            <span className="text-slate-400 line-clamp-1">{ELEMENT_DEFS[selectedElement].description}</span>
          </div>
          <span className="shrink-0 text-slate-400 ml-2">
            Density: {ELEMENT_DEFS[selectedElement].density}
          </span>
        </div>
      )}
    </div>
  );
};
