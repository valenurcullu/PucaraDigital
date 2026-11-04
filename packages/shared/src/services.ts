import type { Club } from './club';

export interface ClubService {
  readonly mode: 'demo' | 'live';
  getClub(clubId: string): Promise<Club>;
}

/** An explicit factory boundary: production cannot silently fall back to demo. */
export function requireDemoMode(mode: string | undefined): 'demo' {
  if (mode === undefined || mode === 'demo') return 'demo';
  throw new Error(
    'El servicio real todavía no está implementado. Usá el modo demo.',
  );
}
