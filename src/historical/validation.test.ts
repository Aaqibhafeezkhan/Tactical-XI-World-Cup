import { describe, expect, it } from 'vitest';
import { validateHistoricalData } from './validation';
import type { HistoricalWorldCupData } from './types';

const provenance = { sourceName: 'Test source', sourceUrl: 'https://example.com/source', retrievedAt: '2026-09-10', asOf: '2026-09-10', origin: 'official' as const, confidence: 'high' as const };

function baseData(): HistoricalWorldCupData {
  return {
    tournaments: [
      { id: 'wc-1942', year: 1942, status: 'not-held', name: 'World Cup 1942', hosts: [], format: 'Not held', participatingTeams: 0, provenance: [provenance] },
      { id: 'wc-1946', year: 1946, status: 'not-held', name: 'World Cup 1946', hosts: [], format: 'Not held', participatingTeams: 0, provenance: [provenance] },
      { id: 'wc-2022', year: 2022, status: 'completed', name: 'World Cup 2022', hosts: [{ name: 'Qatar' }], format: 'Group and knockout', participatingTeams: 32, championTeamId: 'ARG', provenance: [provenance] },
    ],
    teamParticipations: [{ id: 'tp-arg', tournamentId: 'wc-2022', teamId: 'ARG', teamName: 'Argentina', provenance: [provenance] }],
    squads: [],
    players: [],
    matches: [],
    lineups: [],
    formations: [],
  };
}

describe('historical data validation', () => {
  it('accepts explicit non-tournaments and valid provenance', () => {
    expect(validateHistoricalData(baseData())).toEqual([]);
  });

  it('rejects orphan team participations', () => {
    const data = baseData();
    data.teamParticipations[0].tournamentId = 'wc-missing';
    expect(validateHistoricalData(data).some(issue => issue.message.includes('unknown tournament'))).toBe(true);
  });

  it('rejects a player whose team participation belongs to another tournament', () => {
    const data = baseData();
    data.players.push({ id: 'p1', tournamentId: 'wc-1942', teamParticipationId: 'tp-arg', name: 'Example', position: 'UNKNOWN', provenance: [provenance] });
    expect(validateHistoricalData(data).some(issue => issue.message.includes('does not match'))).toBe(true);
  });

  it('rejects lineups with players from another team', () => {
    const data = baseData();
    data.teamParticipations.push({ id: 'tp-fra', tournamentId: 'wc-2022', teamId: 'FRA', teamName: 'France', provenance: [provenance] });
    data.players.push({ id: 'p-arg', tournamentId: 'wc-2022', teamParticipationId: 'tp-arg', name: 'Argentina Player', position: 'FWD', provenance: [provenance] });
    data.players.push({ id: 'p-fra', tournamentId: 'wc-2022', teamParticipationId: 'tp-fra', name: 'France Player', position: 'FWD', provenance: [provenance] });
    data.matches.push({ id: 'm1', tournamentId: 'wc-2022', stage: 'final', homeTeamParticipationId: 'tp-arg', awayTeamParticipationId: 'tp-fra', provenance: [provenance] });
    data.lineups.push({ id: 'l1', matchId: 'm1', teamParticipationId: 'tp-arg', playerIds: ['p-fra'], isReconstructed: false, provenance: [provenance] });
    expect(validateHistoricalData(data).some(issue => issue.message.includes('belongs to a different team'))).toBe(true);
  });

  it('rejects malformed provenance URLs', () => {
    const data = baseData();
    data.tournaments[2].provenance[0].sourceUrl = 'not-a-url';
    expect(validateHistoricalData(data).some(issue => issue.path.includes('sourceUrl'))).toBe(true);
  });
});
