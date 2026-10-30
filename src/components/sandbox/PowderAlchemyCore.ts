// Powder Alchemy Simulation Core
// High-performance double-buffered cellular automata with thermodynamics,
// fluid mechanics, chemical reactions, and biological propagation.

export enum ElementType {
  EMPTY = 0,
  WALL = 1,
  SAND = 2,
  WATER = 3,
  FIRE = 4,
  WOOD = 5,
  PLANT = 6,
  SEED = 7,
  DIRT = 8,
  STONE = 9,
  LAVA = 10,
  OIL = 11,
  ACID = 12,
  GLASS = 13,
  ICE = 14,
  STEAM = 15,
  SMOKE = 16,
  GAS = 17,
  NITRO = 18,
  METAL = 19,
  SPONGE = 20,
  SPORE = 21,
  // Tools
  ERASER = 99,
}

export interface ElementDef {
  id: ElementType;
  name: string;
  category: 'solids' | 'liquids' | 'gases' | 'life';
  description: string;
  color: [number, number, number];
  colorVar?: number; // color variance for texture
  density: number; // for liquid/powder stratification (heavier sinks below lighter)
  flammable?: boolean;
  baseTemp?: number; // default temp in Celsius
}

export const ELEMENT_DEFS: Record<number, ElementDef> = {
  [ElementType.EMPTY]: {
    id: ElementType.EMPTY,
    name: 'Air / Empty',
    category: 'gases',
    description: 'Empty space allowing particles and fluids to pass through.',
    color: [10, 12, 22],
    density: 0,
    baseTemp: 22,
  },
  [ElementType.WALL]: {
    id: ElementType.WALL,
    name: 'Wall',
    category: 'solids',
    description: 'Indestructible barrier that blocks fluids and particles.',
    color: [110, 118, 135],
    colorVar: 8,
    density: 99999,
    baseTemp: 22,
  },
  [ElementType.SAND]: {
    id: ElementType.SAND,
    name: 'Sand',
    category: 'solids',
    description: 'Heavy falling powder that piles up. Melts into glass at high heat.',
    color: [245, 190, 80],
    colorVar: 20,
    density: 1600,
    baseTemp: 22,
  },
  [ElementType.DIRT]: {
    id: ElementType.DIRT,
    name: 'Soil',
    category: 'solids',
    description: 'Moisture-holding granular earth. Essential for sprouting seeds.',
    color: [130, 82, 45],
    colorVar: 15,
    density: 1500,
    baseTemp: 20,
  },
  [ElementType.STONE]: {
    id: ElementType.STONE,
    name: 'Stone',
    category: 'solids',
    description: 'Solid heavy mineral rock. Melts into lava under intense heat.',
    color: [140, 145, 155],
    colorVar: 12,
    density: 2600,
    baseTemp: 22,
  },
  [ElementType.WOOD]: {
    id: ElementType.WOOD,
    name: 'Wood',
    category: 'solids',
    description: 'Organic flammable structure. Burns into smoke, ash, and embers.',
    color: [142, 85, 38],
    colorVar: 10,
    density: 800,
    flammable: true,
    baseTemp: 22,
  },
  [ElementType.GLASS]: {
    id: ElementType.GLASS,
    name: 'Glass',
    category: 'solids',
    description: 'Smooth transparent solid formed from heated sand. Resists acid.',
    color: [160, 220, 245],
    colorVar: 10,
    density: 2400,
    baseTemp: 22,
  },
  [ElementType.METAL]: {
    id: ElementType.METAL,
    name: 'Metal',
    category: 'solids',
    description: 'Heavy conductor. Spreads heat quickly and resists normal flames.',
    color: [175, 185, 205],
    colorVar: 8,
    density: 7800,
    baseTemp: 22,
  },
  [ElementType.ICE]: {
    id: ElementType.ICE,
    name: 'Ice',
    category: 'solids',
    description: 'Frozen crystal solid. Melts rapidly into water above 0°C.',
    color: [180, 235, 255],
    colorVar: 12,
    density: 920,
    baseTemp: -10,
  },
  [ElementType.SPONGE]: {
    id: ElementType.SPONGE,
    name: 'Sponge',
    category: 'solids',
    description: 'Porous material that absorbs nearby water until saturated.',
    color: [225, 210, 70],
    colorVar: 15,
    density: 300,
    flammable: true,
    baseTemp: 22,
  },
  // Liquids
  [ElementType.WATER]: {
    id: ElementType.WATER,
    name: 'Water',
    category: 'liquids',
    description: 'Fluid that flows, extinguishes fire, cools lava, and boils to steam.',
    color: [40, 140, 240],
    colorVar: 15,
    density: 1000,
    baseTemp: 20,
  },
  [ElementType.OIL]: {
    id: ElementType.OIL,
    name: 'Oil',
    category: 'liquids',
    description: 'Lighter than water (floats on top). Highly flammable black fuel.',
    color: [140, 105, 40],
    colorVar: 12,
    density: 820,
    flammable: true,
    baseTemp: 22,
  },
  [ElementType.ACID]: {
    id: ElementType.ACID,
    name: 'Acid',
    category: 'liquids',
    description: 'Corrosive green fluid that dissolves solids and organics.',
    color: [120, 230, 45],
    colorVar: 18,
    density: 1300,
    baseTemp: 35,
  },
  [ElementType.LAVA]: {
    id: ElementType.LAVA,
    name: 'Lava',
    category: 'liquids',
    description: 'Molten rock at 1200°C. Ignites everything and creates obsidian.',
    color: [255, 90, 20],
    colorVar: 25,
    density: 2800,
    baseTemp: 1200,
  },
  [ElementType.NITRO]: {
    id: ElementType.NITRO,
    name: 'Nitro',
    category: 'liquids',
    description: 'Volatile explosive compound. Detonates with massive shockwaves.',
    color: [235, 75, 145],
    colorVar: 15,
    density: 1500,
    flammable: true,
    baseTemp: 22,
  },
  // Gases
  [ElementType.FIRE]: {
    id: ElementType.FIRE,
    name: 'Fire',
    category: 'gases',
    description: 'Rises, heats surroundings, consumes fuels, and creates smoke.',
    color: [255, 170, 30],
    colorVar: 30,
    density: -50,
    baseTemp: 600,
  },
  [ElementType.SMOKE]: {
    id: ElementType.SMOKE,
    name: 'Smoke',
    category: 'gases',
    description: 'Combustion byproduct. Drifts upward and gradually dissipates.',
    color: [140, 145, 155],
    colorVar: 20,
    density: -20,
    baseTemp: 70,
  },
  [ElementType.STEAM]: {
    id: ElementType.STEAM,
    name: 'Steam',
    category: 'gases',
    description: 'Hot water vapor. Rises and condenses back to rain when cooled.',
    color: [210, 230, 245],
    colorVar: 10,
    density: -30,
    baseTemp: 110,
  },
  [ElementType.GAS]: {
    id: ElementType.GAS,
    name: 'Methane',
    category: 'gases',
    description: 'Invisible combustible gas. Flashes violently when ignited.',
    color: [190, 175, 235],
    colorVar: 10,
    density: -40,
    flammable: true,
    baseTemp: 22,
  },
  // Life
  [ElementType.SEED]: {
    id: ElementType.SEED,
    name: 'Seed',
    category: 'life',
    description: 'Tiny plant embryo. Germinates when in contact with moist soil.',
    color: [90, 210, 100],
    colorVar: 15,
    density: 1100,
    flammable: true,
    baseTemp: 22,
  },
  [ElementType.PLANT]: {
    id: ElementType.PLANT,
    name: 'Vine / Plant',
    category: 'life',
    description: 'Living foliage. Grows upward toward light; catches fire easily.',
    color: [35, 170, 75],
    colorVar: 20,
    density: 900,
    flammable: true,
    baseTemp: 22,
  },
  [ElementType.SPORE]: {
    id: ElementType.SPORE,
    name: 'Spore / Algae',
    category: 'life',
    description: 'Airborne botanical spore that spreads across water surfaces.',
    color: [60, 220, 170],
    colorVar: 15,
    density: 50,
    flammable: true,
    baseTemp: 22,
  },
};

export type GravityDirection = 'down' | 'zero' | 'up';

export class PowderSimulationGrid {
  public width: number;
  public height: number;
  public grid: Uint8Array;
  public temp: Int16Array;
  public life: Uint8Array; // used for gas lifespan, fire decay, plant growth stage
  public updated: Uint8Array; // prevents updating same particle multiple times in 1 tick
  public gravity: GravityDirection = 'down';
  public particleCount: number = 0;

  constructor(width: number = 200, height: number = 140) {
    this.width = width;
    this.height = height;
    const size = width * height;
    this.grid = new Uint8Array(size);
    this.temp = new Int16Array(size);
    this.life = new Uint8Array(size);
    this.updated = new Uint8Array(size);
    this.clear();
  }

  public clear(): void {
    this.grid.fill(ElementType.EMPTY);
    this.temp.fill(22); // ambient 22°C
    this.life.fill(0);
    this.updated.fill(0);
    this.particleCount = 0;

    // Draw bottom, left, and right protective stone boundary
    for (let x = 0; x < this.width; x++) {
      this.set(x, this.height - 1, ElementType.WALL);
      this.set(x, 0, ElementType.WALL);
    }
    for (let y = 0; y < this.height; y++) {
      this.set(0, y, ElementType.WALL);
      this.set(this.width - 1, y, ElementType.WALL);
    }
  }

  public index(x: number, y: number): number {
    return y * this.width + x;
  }

  public inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public get(x: number, y: number): ElementType {
    if (!this.inBounds(x, y)) return ElementType.WALL;
    return this.grid[this.index(x, y)];
  }

  public set(x: number, y: number, type: ElementType, baseTemp?: number): void {
    if (!this.inBounds(x, y)) return;
    const idx = this.index(x, y);
    const oldType = this.grid[idx];
    this.grid[idx] = type;
    this.life[idx] = type === ElementType.FIRE ? 12 + Math.floor(Math.random() * 10) : 0;
    this.temp[idx] = baseTemp ?? ELEMENT_DEFS[type]?.baseTemp ?? 22;

    if (oldType === ElementType.EMPTY && type !== ElementType.EMPTY) {
      this.particleCount++;
    } else if (oldType !== ElementType.EMPTY && type === ElementType.EMPTY) {
      this.particleCount = Math.max(0, this.particleCount - 1);
    }
  }

  public swap(x1: number, y1: number, x2: number, y2: number): void {
    const idx1 = this.index(x1, y1);
    const idx2 = this.index(x2, y2);
    const tempType = this.grid[idx1];
    this.grid[idx1] = this.grid[idx2];
    this.grid[idx2] = tempType;

    const tTemp = this.temp[idx1];
    this.temp[idx1] = this.temp[idx2];
    this.temp[idx2] = tTemp;

    const tLife = this.life[idx1];
    this.life[idx1] = this.life[idx2];
    this.life[idx2] = tLife;

    this.updated[idx2] = 1;
  }

  // Draw circle brush
  public paint(
    cx: number,
    cy: number,
    radius: number,
    type: ElementType,
    density: number = 0.85
  ): void {
    const rSq = radius * radius;
    const minX = Math.max(1, Math.floor(cx - radius));
    const maxX = Math.min(this.width - 2, Math.ceil(cx + radius));
    const minY = Math.max(1, Math.floor(cy - radius));
    const maxY = Math.min(this.height - 2, Math.ceil(cy + radius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= rSq) {
          if (Math.random() <= density) {
            if (type === ElementType.ERASER) {
              this.set(x, y, ElementType.EMPTY);
            } else {
              // Don't overwrite indestructible wall unless eraser
              if (this.get(x, y) !== ElementType.WALL) {
                this.set(x, y, type);
              }
            }
          }
        }
      }
    }
  }

  // Main simulation tick
  public step(): void {
    this.updated.fill(0);
    const grav = this.gravity;
    const isDown = grav === 'down';
    const isUp = grav === 'up';

    // Scan direction alternates to avoid directional drift
    const startY = isDown ? this.height - 2 : 1;
    const endY = isDown ? 0 : this.height - 1;
    const dy = isDown ? -1 : 1;

    for (let y = startY; isDown ? y > endY : y < endY; y += dy) {
      // Alternate horizontal scan direction each row
      const leftToRight = (y % 2 === 0);
      const startX = leftToRight ? 1 : this.width - 2;
      const endX = leftToRight ? this.width - 1 : 0;
      const dx = leftToRight ? 1 : -1;

      for (let x = startX; leftToRight ? x < endX : x > endX; x += dx) {
        const idx = this.index(x, y);
        if (this.updated[idx]) continue;

        const type = this.grid[idx];
        if (type === ElementType.EMPTY || type === ElementType.WALL) continue;

        this.updateParticle(x, y, type);
      }
    }
  }

  private updateParticle(x: number, y: number, type: ElementType): void {
    const grav = this.gravity;
    const downY = grav === 'up' ? y - 1 : y + 1;
    const upY = grav === 'up' ? y + 1 : y - 1;
    const rndDir = Math.random() < 0.5 ? 1 : -1;

    // 1. THERMODYNAMICS & HEAT TRANSFER
    const currentTemp = this.temp[this.index(x, y)];
    this.diffuseHeat(x, y, currentTemp);

    // 2. ELEMENT SPECIFIC LOGIC
    switch (type) {
      // --- SOLIDS & POWDERS ---
      case ElementType.SAND:
      case ElementType.DIRT:
      case ElementType.SEED: {
        // Sand melts into Glass at high temperatures (above 1100°C)
        if (type === ElementType.SAND && currentTemp > 1100) {
          this.set(x, y, ElementType.GLASS);
          return;
        }

        // Seed germination on wet soil
        if (type === ElementType.SEED) {
          if (this.checkAdjacent(x, y, ElementType.WATER) || this.checkAdjacent(x, y, ElementType.DIRT)) {
            if (Math.random() < 0.05) {
              this.set(x, y, ElementType.PLANT);
              return;
            }
          }
        }

        // Gravity movement for powders
        if (grav !== 'zero') {
          const below = this.get(x, downY);
          if (this.canDisplace(type, below)) {
            this.swap(x, y, x, downY);
          } else {
            const leftBelow = this.get(x - rndDir, downY);
            const rightBelow = this.get(x + rndDir, downY);
            if (this.canDisplace(type, leftBelow)) {
              this.swap(x, y, x - rndDir, downY);
            } else if (this.canDisplace(type, rightBelow)) {
              this.swap(x, y, x + rndDir, downY);
            }
          }
        }
        break;
      }

      // --- ICE ---
      case ElementType.ICE: {
        if (currentTemp > 2 || this.checkAdjacentTemp(x, y) > 40) {
          this.set(x, y, ElementType.WATER, 4);
        }
        break;
      }

      // --- LIQUIDS (Water, Oil, Acid, Lava, Nitro) ---
      case ElementType.WATER:
      case ElementType.OIL:
      case ElementType.ACID:
      case ElementType.LAVA:
      case ElementType.NITRO: {
        // Water boils into Steam at 100°C
        if (type === ElementType.WATER && currentTemp >= 100) {
          this.set(x, y, ElementType.STEAM, 110);
          return;
        }

        // Water freezes to Ice below 0°C
        if (type === ElementType.WATER && currentTemp <= -2) {
          this.set(x, y, ElementType.ICE, -5);
          return;
        }

        // Lava reactions: Lava + Water -> Obsidian/Stone + Steam
        if (type === ElementType.LAVA) {
          if (this.reactAdjacent(x, y, ElementType.WATER, ElementType.STEAM)) {
            this.set(x, y, ElementType.STONE, 300);
            return;
          }
          // Lava melts stone or sand into lava
          if (Math.random() < 0.02) {
            this.meltAdjacent(x, y);
          }
        }

        // Acid dissolves organics and metals
        if (type === ElementType.ACID) {
          if (this.dissolveAdjacent(x, y)) {
            // Acid spends itself
            if (Math.random() < 0.3) {
              this.set(x, y, ElementType.SMOKE);
              return;
            }
          }
        }

        // Nitro detonation check
        if (type === ElementType.NITRO) {
          if (currentTemp > 180 || this.checkAdjacent(x, y, ElementType.FIRE) || this.checkAdjacent(x, y, ElementType.LAVA)) {
            this.explode(x, y, 16);
            return;
          }
        }

        // Fluid flow dynamics (Down -> Down Diagonals -> Horizontal slide)
        if (grav !== 'zero') {
          const below = this.get(x, downY);
          if (this.canDisplace(type, below)) {
            this.swap(x, y, x, downY);
          } else {
            const d1 = this.get(x - rndDir, downY);
            const d2 = this.get(x + rndDir, downY);
            if (this.canDisplace(type, d1)) {
              this.swap(x, y, x - rndDir, downY);
            } else if (this.canDisplace(type, d2)) {
              this.swap(x, y, x + rndDir, downY);
            } else {
              // Horizontal liquid spread
              const h1 = this.get(x - rndDir, y);
              const h2 = this.get(x + rndDir, y);
              if (this.canDisplace(type, h1)) {
                this.swap(x, y, x - rndDir, y);
              } else if (this.canDisplace(type, h2)) {
                this.swap(x, y, x + rndDir, y);
              }
            }
          }
        }
        break;
      }

      // --- GASES (Fire, Smoke, Steam, Gas) ---
      case ElementType.FIRE: {
        const idx = this.index(x, y);
        this.life[idx]--;

        // Ignites adjacent flammables
        this.igniteAdjacent(x, y);

        // Water extinguishes fire
        if (this.checkAdjacent(x, y, ElementType.WATER)) {
          this.set(x, y, ElementType.STEAM);
          return;
        }

        if (this.life[idx] <= 0) {
          this.set(x, y, Math.random() < 0.4 ? ElementType.SMOKE : ElementType.EMPTY);
          return;
        }

        // Fire flickers and rises
        const riseY = upY;
        const target = this.get(x, riseY);
        if (target === ElementType.EMPTY) {
          this.swap(x, y, x, riseY);
        } else if (this.get(x + rndDir, riseY) === ElementType.EMPTY) {
          this.swap(x, y, x + rndDir, riseY);
        }
        break;
      }

      case ElementType.SMOKE:
      case ElementType.STEAM:
      case ElementType.GAS: {
        // Steam condenses back to water at top or when cooled
        if (type === ElementType.STEAM && (y <= 3 || currentTemp < 60)) {
          if (Math.random() < 0.05) {
            this.set(x, y, ElementType.WATER, 40);
            return;
          }
        }

        // Gas ignition
        if (type === ElementType.GAS) {
          if (currentTemp > 200 || this.checkAdjacent(x, y, ElementType.FIRE) || this.checkAdjacent(x, y, ElementType.LAVA)) {
            this.explode(x, y, 10);
            return;
          }
        }

        // Dispersal life decay
        if (type === ElementType.SMOKE && Math.random() < 0.03) {
          this.set(x, y, ElementType.EMPTY);
          return;
        }

        // Rises upward and drifts
        const riseY = upY;
        const above = this.get(x, riseY);
        if (above === ElementType.EMPTY) {
          this.swap(x, y, x, riseY);
        } else {
          const s1 = this.get(x - rndDir, riseY);
          const s2 = this.get(x + rndDir, riseY);
          if (s1 === ElementType.EMPTY) {
            this.swap(x, y, x - rndDir, riseY);
          } else if (s2 === ElementType.EMPTY) {
            this.swap(x, y, x + rndDir, riseY);
          } else {
            // Horizontal vapor drift
            const h = this.get(x + rndDir, y);
            if (h === ElementType.EMPTY) {
              this.swap(x, y, x + rndDir, y);
            }
          }
        }
        break;
      }

      // --- LIVING ELEMENTS (Plant, Spore) ---
      case ElementType.PLANT: {
        // Burns easily
        if (currentTemp > 180 || this.checkAdjacent(x, y, ElementType.FIRE) || this.checkAdjacent(x, y, ElementType.LAVA)) {
          this.set(x, y, ElementType.FIRE, 500);
          return;
        }

        // Vine growth: if adjacent to water or moist dirt, grow upward or sideways
        if (Math.random() < 0.04) {
          if (this.checkAdjacent(x, y, ElementType.WATER) || this.checkAdjacent(x, y, ElementType.DIRT)) {
            // Grow into empty cell above or diagonal
            const gx = x + (Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0);
            const gy = y - 1;
            if (this.get(gx, gy) === ElementType.EMPTY) {
              this.set(gx, gy, ElementType.PLANT);
            }
          }
        }
        break;
      }

      case ElementType.SPORE: {
        // Spreads on water surfaces
        if (this.checkAdjacent(x, y, ElementType.WATER)) {
          if (Math.random() < 0.06) {
            const sx = x + rndDir;
            if (this.get(sx, y) === ElementType.WATER) {
              this.set(sx, y, ElementType.SPORE);
            }
          }
        } else {
          // Drifts like light powder
          if (grav !== 'zero' && Math.random() < 0.5) {
            if (this.get(x, downY) === ElementType.EMPTY) {
              this.swap(x, y, x, downY);
            }
          }
        }
        break;
      }

      // --- WOOD & SPONGE ---
      case ElementType.WOOD:
      case ElementType.SPONGE: {
        // Absorbs water
        if (type === ElementType.SPONGE) {
          this.absorbAdjacentWater(x, y);
        }

        // Catches fire
        if (currentTemp > 240 || this.checkAdjacent(x, y, ElementType.FIRE) || this.checkAdjacent(x, y, ElementType.LAVA)) {
          this.set(x, y, ElementType.FIRE, 600);
        }
        break;
      }

      default:
        break;
    }
  }

  // Density-based displacement (e.g. sand falls through water; water sinks below oil)
  private canDisplace(source: ElementType, target: ElementType): boolean {
    if (target === ElementType.EMPTY) return true;
    if (target === ElementType.WALL || target === ElementType.STONE || target === ElementType.GLASS || target === ElementType.METAL) return false;

    const sourceDensity = ELEMENT_DEFS[source]?.density ?? 0;
    const targetDensity = ELEMENT_DEFS[target]?.density ?? 0;

    return sourceDensity > targetDensity;
  }

  // Heat diffusion to adjacent cells
  private diffuseHeat(x: number, y: number, currentTemp: number): void {
    if (Math.random() > 0.3) return;
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    const rndNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    const nx = rndNeighbor[0];
    const ny = rndNeighbor[1];
    if (this.inBounds(nx, ny)) {
      const nIdx = this.index(nx, ny);
      const nTemp = this.temp[nIdx];
      const diff = (currentTemp - nTemp) * 0.25;
      this.temp[this.index(x, y)] = Math.round(currentTemp - diff);
      this.temp[nIdx] = Math.round(nTemp + diff);
    }
  }

  private checkAdjacent(x: number, y: number, type: ElementType): boolean {
    return (
      this.get(x + 1, y) === type ||
      this.get(x - 1, y) === type ||
      this.get(x, y + 1) === type ||
      this.get(x, y - 1) === type
    );
  }

  private checkAdjacentTemp(x: number, y: number): number {
    let maxT = -999;
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (this.inBounds(nx, ny)) {
        maxT = Math.max(maxT, this.temp[this.index(nx, ny)]);
      }
    }
    return maxT;
  }

  private reactAdjacent(x: number, y: number, match: ElementType, replaceWith: ElementType): boolean {
    const coords = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of coords) {
      if (this.get(nx, ny) === match) {
        this.set(nx, ny, replaceWith);
        return true;
      }
    }
    return false;
  }

  private meltAdjacent(x: number, y: number): void {
    const coords = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of coords) {
      const t = this.get(nx, ny);
      if (t === ElementType.STONE || t === ElementType.SAND) {
        this.set(nx, ny, ElementType.LAVA, 1100);
        return;
      }
    }
  }

  private dissolveAdjacent(x: number, y: number): boolean {
    const coords = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of coords) {
      const t = this.get(nx, ny);
      if (
        t === ElementType.WOOD ||
        t === ElementType.PLANT ||
        t === ElementType.SEED ||
        t === ElementType.DIRT ||
        t === ElementType.STONE ||
        t === ElementType.METAL
      ) {
        this.set(nx, ny, ElementType.SMOKE);
        return true;
      }
    }
    return false;
  }

  private absorbAdjacentWater(x: number, y: number): void {
    const coords = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of coords) {
      if (this.get(nx, ny) === ElementType.WATER) {
        this.set(nx, ny, ElementType.EMPTY);
        return;
      }
    }
  }

  private igniteAdjacent(x: number, y: number): void {
    const coords = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of coords) {
      const t = this.get(nx, ny);
      if (
        t === ElementType.WOOD ||
        t === ElementType.PLANT ||
        t === ElementType.OIL ||
        t === ElementType.GAS ||
        t === ElementType.SEED ||
        t === ElementType.SPONGE
      ) {
        this.set(nx, ny, ElementType.FIRE, 550);
      } else if (t === ElementType.NITRO) {
        this.explode(nx, ny, 16);
      }
    }
  }

  // Powerful kinetic shockwave explosion
  public explode(cx: number, cy: number, radius: number): void {
    const rSq = radius * radius;
    const minX = Math.max(1, Math.floor(cx - radius));
    const maxX = Math.min(this.width - 2, Math.ceil(cx + radius));
    const minY = Math.max(1, Math.floor(cy - radius));
    const maxY = Math.min(this.height - 2, Math.ceil(cy + radius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy;
        if (distSq <= rSq) {
          const current = this.get(x, y);
          if (current === ElementType.WALL) continue; // Walls withstand explosions

          if (current === ElementType.NITRO) {
            // Chain reaction!
            this.set(x, y, ElementType.FIRE, 1000);
          } else if (distSq < rSq * 0.4) {
            // Core fireball
            this.set(x, y, Math.random() < 0.7 ? ElementType.FIRE : ElementType.SMOKE, 850);
          } else if (distSq < rSq * 0.8) {
            // Outer heat / smoke
            this.set(x, y, Math.random() < 0.5 ? ElementType.SMOKE : ElementType.FIRE, 600);
          } else {
            // Shockwave throws movable particles outward
            const dirX = Math.sign(dx);
            const dirY = Math.sign(dy);
            const targetX = x + dirX * 2;
            const targetY = y + dirY * 2;
            if (this.inBounds(targetX, targetY) && this.get(targetX, targetY) === ElementType.EMPTY) {
              this.swap(x, y, targetX, targetY);
            }
          }
        }
      }
    }
  }

  // Load predefined scene templates
  public loadPreset(name: 'crucible' | 'biolab' | 'refinery' | 'clean'): void {
    this.clear();
    const w = this.width;
    const h = this.height;

    switch (name) {
      case 'crucible': {
        // Glass reservoir left, Stone bowl right with lava, divider
        for (let y = h - 50; y < h - 1; y++) {
          this.set(Math.floor(w * 0.5), y, ElementType.GLASS);
        }
        // Fill left with water
        for (let y = h - 45; y < h - 5; y++) {
          for (let x = 10; x < Math.floor(w * 0.45); x++) {
            this.set(x, y, ElementType.WATER);
          }
        }
        // Stone container on right
        for (let x = Math.floor(w * 0.55); x < w - 10; x++) {
          this.set(x, h - 10, ElementType.STONE);
        }
        for (let y = h - 35; y < h - 10; y++) {
          this.set(Math.floor(w * 0.55), y, ElementType.STONE);
          this.set(w - 10, y, ElementType.STONE);
        }
        // Fill right with Lava
        for (let y = h - 30; y < h - 11; y++) {
          for (let x = Math.floor(w * 0.56); x < w - 11; x++) {
            this.set(x, y, ElementType.LAVA, 1200);
          }
        }
        break;
      }

      case 'biolab': {
        // Soil base with water lake and seeds/plants, acid beaker above
        for (let y = h - 25; y < h - 1; y++) {
          for (let x = 10; x < w - 10; x++) {
            this.set(x, y, ElementType.DIRT);
          }
        }
        // Water pond in center
        for (let y = h - 22; y < h - 10; y++) {
          for (let x = Math.floor(w * 0.35); x < Math.floor(w * 0.65); x++) {
            this.set(x, y, ElementType.WATER);
          }
        }
        // Plants and seeds on sides
        for (let x = 15; x < Math.floor(w * 0.3); x += 4) {
          this.set(x, h - 26, ElementType.PLANT);
          this.set(x + 2, h - 26, ElementType.SEED);
        }
        for (let x = Math.floor(w * 0.7); x < w - 15; x += 4) {
          this.set(x, h - 26, ElementType.PLANT);
          this.set(x + 1, h - 26, ElementType.SEED);
        }
        // Suspended glass beaker of acid
        const bx = Math.floor(w * 0.4);
        const by = 30;
        for (let x = bx; x < bx + 40; x++) {
          this.set(x, by + 20, ElementType.GLASS);
        }
        for (let y = by; y < by + 20; y++) {
          this.set(bx, y, ElementType.GLASS);
          this.set(bx + 40, y, ElementType.GLASS);
        }
        for (let y = by + 5; y < by + 19; y++) {
          for (let x = bx + 1; x < bx + 40; x++) {
            this.set(x, y, ElementType.ACID);
          }
        }
        break;
      }

      case 'refinery': {
        // Oil tank, wooden scaffolding, nitro barrel
        const mx = Math.floor(w * 0.5);
        // Wood platforms
        for (let x = 20; x < w - 20; x += 2) {
          this.set(x, h - 40, ElementType.WOOD);
        }
        // Oil reservoir underneath
        for (let y = h - 35; y < h - 5; y++) {
          for (let x = 25; x < mx - 10; x++) {
            this.set(x, y, ElementType.OIL);
          }
        }
        // Nitro cluster on platform
        for (let y = h - 45; y < h - 41; y++) {
          for (let x = mx + 15; x < mx + 30; x++) {
            this.set(x, y, ElementType.NITRO);
          }
        }
        // Metal conductor wire leading toward nitro
        for (let x = mx; x < mx + 15; x++) {
          this.set(x, h - 42, ElementType.METAL);
        }
        break;
      }

      case 'clean':
      default:
        // Already clean with border
        break;
    }
  }
}
