import { describe, expect, it } from 'vitest';
import {
  clubSchema,
  createDemoClubService,
  demoClub,
  requireDemoMode,
} from './index';

describe('demo boundary', () => {
  it('defaults to demo and rejects a requested production service', () => {
    expect(requireDemoMode(undefined)).toBe('demo');
    expect(requireDemoMode('demo')).toBe('demo');
    expect(() => requireDemoMode('live')).toThrow('no está implementado');
    expect(() => requireDemoMode('demoo')).toThrow();
  });

  it('rejects requests for an unrelated club', async () => {
    await expect(
      createDemoClubService().getClub('another-club'),
    ).rejects.toThrow();
  });

  it('returns independent data, so callers cannot mutate the demo source', async () => {
    const service = createDemoClubService();
    const club = await service.getClub(demoClub.id);
    club.name = 'Changed';
    expect((await service.getClub(demoClub.id)).name).toBe('Pucará');
  });

  it('validates club identities and configurable branding at the boundary', () => {
    expect(clubSchema.safeParse({ ...demoClub, id: 'invalid' }).success).toBe(
      false,
    );
    expect(
      clubSchema.safeParse({
        ...demoClub,
        branding: { primary: 'red', logoUrl: 'invalid' },
      }).success,
    ).toBe(false);
  });
});
