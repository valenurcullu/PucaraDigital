import { z } from 'zod';

export const clubSchema = z.object({
  id: z.uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(100),
  timezone: z.literal('America/Argentina/Buenos_Aires'),
  branding: z.object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    logoUrl: z.url().nullable(),
  }),
});

export type Club = z.infer<typeof clubSchema>;

export const clubRoleSchema = z.enum([
  'member',
  'administrator',
  'fitness_coach',
  'team_coach',
  'activity_instructor',
]);

export type ClubRole = z.infer<typeof clubRoleSchema>;
