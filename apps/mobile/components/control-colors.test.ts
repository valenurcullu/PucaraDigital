import { describe, it, expect } from 'vitest';
import { memberTheme } from '@pucara/design-tokens';
import { buttonColors, controlColors } from './control-colors';
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
describe('contraste AA de texto y superficies', () => {
  it.each(Object.entries(controlColors))(
    '%s conserva 4.5:1 incluso al presionar',
    (_, colors) => {
      for (const background of [colors.fill, colors.pressed])
        expect(contrast(colors.ink, background)).toBeGreaterThanOrEqual(4.5);
    },
  );
  it('comprueba etiquetas, estados y texto secundario', () => {
    const c = memberTheme.color;
    for (const [ink, fill] of [
      [c.text, c.surface],
      [c.secondaryText, c.background],
      [c.secondaryText, c.navySoft],
      [c.action, c.actionSoft],
      [c.onDarkMuted, c.navy],
      [c.error, c.errorBackground],
      [c.success, c.successBackground],
    ] as const)
      expect(contrast(ink, fill)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.controlBorder, c.surface)).toBeGreaterThanOrEqual(3);
    expect(buttonColors('destructive', true)).toBe(controlColors.disabled);
  });
});
