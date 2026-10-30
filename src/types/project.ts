export type ProjectCategory = 'Websites' | 'Games' | 'Tools' | 'Experiments';

export type ProjectStatus = 'Live' | 'In Development';

export type DemoType =
  | 'threejs-game'
  | 'neon-dreams'
  | 'cellular-automata'
  | 'audio-synth'
  | 'markdown-reader'
  | 'neural-network'
  | 'sandbox-alchemy'
  | 'ragdoll-escape';

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  tags: string[];
  technologies: string[];
  features: string[];
  demoType: DemoType;
  accentColor: 'lime' | 'violet' | 'cyan' | 'orange';
  completionDate: string;
  gridSpan?: 'normal' | 'wide' | 'tall';
}

export interface ExplorationTopic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  accentColor: 'lime' | 'violet' | 'cyan' | 'orange';
  currentFocus: string;
}
