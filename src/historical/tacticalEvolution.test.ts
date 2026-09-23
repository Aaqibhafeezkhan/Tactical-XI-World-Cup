import { describe, expect, it } from 'vitest';
import { aggregateProfilesFromTournamentMap, eraBucketForYear, formationFamily } from './tacticalEvolution';
import type { HistoricalFormation } from './types';

const formation = (id: string, name: string): HistoricalFormation => ({
  id,
  name,
  positions: [{ playerId: 'p1', x: 10, y: 20 }, { playerId: 'p2', x: 90, y: 80 }],
  origin: 'reconstructed',
  confidence: 'medium',
  provenance: [],
});

describe('tactical evolution analysis', () => {
  it('assigns the documented era buckets', () => {
    expect(eraBucketForYear(1958)).toBe('pre-1960');
    expect(eraBucketForYear(1970)).toBe('1960s-70s');
    expect(eraBucketForYear(1994)).toBe('1980s-90s');
    expect(eraBucketForYear(2022)).toBe('modern');
    expect(eraBucketForYear(1942)).toBe('pre-1960');
    expect(eraBucketForYear(2100)).toBeNull();
  });

  it('normalizes formation family names', () => {
    expect(formationFamily(' 4 - 3 - 3 ')).toBe('4-3-3');
  });

  it('aggregates formation appearances and shares within an era', () => {
    const profiles = aggregateProfilesFromTournamentMap(
      [formation('f1', '4-3-3'), formation('f2', '4-3-3'), formation('f3', '4-4-2')],
      [{ formationId: 'f1', year: 1970 }, { formationId: 'f2', year: 1974 }, { formationId: 'f3', year: 1978 }],
    );
    const era = profiles.find(profile => profile.id === '1960s-70s')!;
    expect(era.totalFormations).toBe(3);
    expect(era.formations[0].formation).toBe('4-3-3');
    expect(era.formations[0].appearances).toBe(2);
    expect(era.formations[0].share).toBeCloseTo(2 / 3);
  });
});
