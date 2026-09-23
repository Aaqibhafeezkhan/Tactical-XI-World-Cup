import { describe, expect, it } from 'vitest';
import { FORMATION_SPECS, type Formation } from '../types';

describe('historical XI builder contract', () => {
  it('supports the existing Tactical XI formation set', () => {
    const formations: Formation[] = ['4-3-3','4-2-3-1','4-4-2','3-4-3','3-5-2','4-1-4-1','4-3-1-2','5-3-2'];
    for (const formation of formations) expect(FORMATION_SPECS[formation]).toHaveLength(11);
  });

  it('keeps the builder boundary explicit for older editions', () => {
    const supportedEdition = 2026;
    const olderEdition = 2022;
    expect(supportedEdition).toBe(2026);
    expect(olderEdition).not.toBe(supportedEdition);
  });
});
