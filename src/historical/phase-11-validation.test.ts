import { describe, expect, it } from 'vitest';
import { HISTORICAL_TOURNAMENTS } from './catalog';
import { loadHistoricalEdition } from './archive';

describe('historical phase 11 validation', () => {
  it('keeps every played edition sourced and structurally complete', () => {
    for (const tournament of HISTORICAL_TOURNAMENTS.filter(item => item.status === 'completed')) {
      expect(tournament.provenance.length).toBeGreaterThan(0);
      expect(tournament.provenance.every(source => source.sourceUrl && source.retrievedAt)).toBe(true);
      expect(tournament.participatingTeams).toBeGreaterThan(0);
      expect(tournament.championTeamId).toBeTruthy();
    }
  });

  it('keeps 1942 and 1946 explicit as not held', () => {
    expect(HISTORICAL_TOURNAMENTS.filter(item => item.status === 'not-held').map(item => item.year)).toEqual([1942, 1946]);
  });

  it('loads played editions through tournament-specific static paths', async () => {
    const originalFetch = globalThis.fetch;
    let requestedPath = '';
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      requestedPath = String(input);
      return new Response(JSON.stringify({ schemaVersion: 1, generatedAt: '2026-09-10', sourcePolicy: { matchArchive: 'test', sourceUrl: 'https://example.com', license: 'test', notes: 'test' }, notHeld: [], tournaments: [], teamParticipations: [], matches: [] }), { status: 200 });
    }) as typeof fetch;
    try {
      await loadHistoricalEdition(2022);
      expect(requestedPath).toBe('/data/historicalWorldCup/2022.json');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
