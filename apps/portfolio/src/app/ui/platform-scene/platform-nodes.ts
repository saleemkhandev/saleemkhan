export interface PlatformNode {
  readonly id: string;
  readonly label: string;
  readonly yaw: number;
  readonly lift: string;
}

/** Hero nodes — actual stack, not a generic sphere of buzzwords. */
export const PLATFORM_NODES: readonly PlatformNode[] = [
  { id: 'angular', label: 'Angular', yaw: 0, lift: '-1.1rem' },
  { id: 'typescript', label: 'TypeScript', yaw: 45, lift: '0.4rem' },
  { id: 'nx', label: 'Nx', yaw: 90, lift: '-0.6rem' },
  { id: 'architecture', label: 'Architecture', yaw: 135, lift: '0.8rem' },
  { id: 'vercel', label: 'Vercel', yaw: 180, lift: '-0.2rem' },
  { id: 'apis', label: 'APIs', yaw: 225, lift: '0.6rem' },
  { id: 'monorepo', label: 'Monorepo', yaw: 270, lift: '-0.9rem' },
  { id: 'mfe', label: 'Micro-frontends', yaw: 315, lift: '0.3rem' },
];
