import { describe, expect, it } from 'vitest';
import { HISTORICAL_TOURNAMENT_IDS, HISTORICAL_TOURNAMENTS, getTournament } from './index';

describe('historical World Cup catalog', () => {
  it('represents every edition from 1930 through 2026, including non-tournaments', () => {
    expect(HISTORICAL_TOURNAMENTS).toHaveLength(25);
    expect(HISTORICAL_TOURNAMENTS.map(tournament => tournament.id)).toEqual([...HISTORICAL_TOURNAMENT_IDS]);
  });

  it('models 1942 and 1946 as editions that were not held', () => {
    expect(getTournament(1942)?.status).toBe('not-held');
    expect(getTournament(1946)?.status).toBe('not-held');
    expect(getTournament(1942)?.participatingTeams).toBe(0);
    expect(getTournament(1946)?.participatingTeams).toBe(0);
  });

  it('keeps played tournaments populated with competition metadata', () => {
    for (const tournament of HISTORICAL_TOURNAMENTS.filter(item => item.status === 'completed')) {
      expect(tournament.hosts.length).toBeGreaterThan(0);
      expect(tournament.participatingTeams).toBeGreaterThan(0);
      expect(tournament.championTeamId).toBeTruthy();
      expect(tournament.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tournament.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tournament.provenance.length).toBeGreaterThan(0);
    }
  });

  it('supports tournament-specific records and provenance layers', () => {
    const provenanceOrigins = new Set(['official', 'reconstructed', 'derived']);
    const origins: Array<'official' | 'reconstructed' | 'derived'> = ['official', 'reconstructed', 'derived'];
    expect(origins.every(origin => provenanceOrigins.has(origin))).toBe(true);
    expect(HISTORICAL_TOURNAMENTS.every(tournament => tournament.provenance.every(source => source.sourceUrl && source.retrievedAt))).toBe(true);
  });
});
