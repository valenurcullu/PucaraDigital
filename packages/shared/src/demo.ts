import { clubSchema } from './club';
import type { ClubService } from './services';

export const demoClub = clubSchema.parse({
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'pucara-demo',
  name: 'Pucará',
  timezone: 'America/Argentina/Buenos_Aires',
  branding: { primary: '#751D32', logoUrl: null },
});

/** Fictional read-only data. No authentication, persistence or backend access. */
export function createDemoClubService(): ClubService {
  return {
    mode: 'demo',
    async getClub(clubId) {
      if (clubId !== demoClub.id) throw new Error('Club demo no encontrado.');
      return clubSchema.parse(demoClub);
    },
  };
}
