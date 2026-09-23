import type { HistoricalMatch, TeamParticipation } from './types';

export interface HistoricalArchiveEdition {
  year: number;
  id: string;
  status: 'completed';
  sourceUrl: string;
  retrievedAt: string;
}

export interface HistoricalArchiveDocument {
  schemaVersion: number;
  generatedAt: string;
  sourcePolicy: {
    matchArchive: string;
    sourceUrl: string;
    license: string;
    notes: string;
  };
  notHeld: Array<{ year: number; id: string; status: 'not-held' }>;
  tournaments: HistoricalArchiveEdition[];
  teamParticipations: TeamParticipation[];
  matches: HistoricalMatch[];
}

export const HISTORICAL_ARCHIVE_PATH = '/data/historicalWorldCup.json';

export function matchesForTournament(archive: HistoricalArchiveDocument, tournamentId: string): HistoricalMatch[] {
  return archive.matches.filter(match => match.tournamentId === tournamentId);
}

export async function loadHistoricalArchive(): Promise<HistoricalArchiveDocument> {
  const response = await fetch(HISTORICAL_ARCHIVE_PATH);
  if (!response.ok) throw new Error(`Unable to load historical World Cup archive (${response.status}).`);
  return response.json() as Promise<HistoricalArchiveDocument>;
}
