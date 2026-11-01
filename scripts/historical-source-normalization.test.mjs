import { describe, expect, it } from 'vitest';
import { isCancelledFixture, normalizeScore, normalizeSourceFixtures } from './historical-source-normalization.mjs';

describe('historical source match normalization', () => {
  it('recognizes both source spellings for canceled fixtures', () => {
    expect(isCancelledFixture({ status: 'canceled' })).toBe(true);
    expect(isCancelledFixture({ status: 'cancelled' })).toBe(true);
    expect(isCancelledFixture({ status: 'completed' })).toBe(false);
  });

  it('keeps canceled fixtures separate from scored fixtures', () => {
    const fixtures = normalizeSourceFixtures([
      { team1: 'Sweden', team2: 'Austria', status: 'canceled' },
      { team1: 'Italy', team2: 'Norway', score: { ft: [2, 1] } },
    ], 1938);

    expect(fixtures[0].score).toBeNull();
    expect(fixtures[1].score.ft).toEqual([2, 1]);
  });

  it('does not invent a score for a fixture without a recorded full-time result', () => {
    expect(normalizeScore(undefined)).toBeNull();
    expect(normalizeScore({ et: [1, 0] })).toBeNull();
  });

  it('normalizes full-time, extra-time, and penalty scores', () => {
    expect(normalizeScore({ ft: [1, 1], et: [2, 1], pens: [4, 3] })).toEqual({
      ft: [1, 1],
      aet: [2, 1],
      pens: [4, 3],
    });
  });

  it('supports the source shorthand score array', () => {
    expect(normalizeScore([2, 0])).toEqual({ ft: [2, 0], aet: undefined, pens: undefined });
  });

  it('rejects malformed recorded scores with fixture context', () => {
    expect(() => normalizeScore({ ft: [1] }, 'World Cup 1938 fixture #4 (A vs B)'))
      .toThrow('Invalid full-time score for World Cup 1938 fixture #4 (A vs B).');
  });

  it('rejects unscored fixtures unless the source explicitly marks them canceled', () => {
    expect(() => normalizeSourceFixtures([{ team1: 'A', team2: 'B' }], 1938))
      .toThrow('World Cup 1938 fixture #1 (A vs B) has no final score and is not marked canceled.');
  });
});
