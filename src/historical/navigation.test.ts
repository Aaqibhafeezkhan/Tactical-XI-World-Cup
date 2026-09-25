import { describe, expect, it } from 'vitest';
import { buildHistoricalHash, parseHistoricalHash } from './navigation';

describe('historical navigation', () => {
  it('parses a tournament and team context from a shareable hash', () => {
    expect(parseHistoricalHash('#history?year=2022&team=Argentina')).toEqual({
      view: 'tournament',
      year: 2022,
      team: 'Argentina',
    });
  });

  it('parses a builder simulation setup', () => {
    expect(parseHistoricalHash('#history?year=2026&view=builder&team=Brazil&opponent=Argentina&formation=4-3-3')).toEqual({
      view: 'builder',
      year: 2026,
      team: 'Brazil',
      opponent: 'Argentina',
      formation: '4-3-3',
    });
  });

  it('round-trips navigation state without dropping context', () => {
    const hash = buildHistoricalHash({
      view: 'matches',
      year: 1954,
      team: 'West Germany',
    });

    expect(hash).toBe('#history?year=1954&view=matches&team=West+Germany');
    expect(parseHistoricalHash(hash)).toEqual({
      view: 'matches',
      year: 1954,
      team: 'West Germany',
    });
  });

  it('falls back safely for an invalid year and unsupported view', () => {
    expect(parseHistoricalHash('#history?year=9999&view=unknown')).toEqual({
      view: 'tournament',
      year: 2022,
    });
  });
});
