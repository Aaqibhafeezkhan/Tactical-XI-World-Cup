import type { HistoricalMatch, TeamParticipation } from './types';

export interface HistoricalArchiveEdition {
  year: number;
  id: string;
  status: 'completed';
  sourceUrl: string;
  retrievedAt: string;
}

export interface HistoricalArchiveManifest {
  schemaVersion: number;
  generatedAt: string;
  sourcePolicy: {
    matchArchive: string;
    sourceUrl: string;
    license: string;
    notes: string;
  };
  notHeld: Array<{ year: number; id: string; status: 'not-held' }>;
  editions: Array<HistoricalArchiveEdition & { file: string }>;
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

export const HISTORICAL_ARCHIVE_MANIFEST_PATH = '/data/historicalWorldCup/index.json';

const editionCache = new Map<number, Promise<HistoricalArchiveDocument>>();

export function historicalEditionPath(year: number): string {
  return `/data/historicalWorldCup/${year}.json`;
}

export function matchesForTournament(archive: HistoricalArchiveDocument, tournamentId: string): HistoricalMatch[] {
  return archive.matches.filter(match => match.tournamentId === tournamentId);
}

export async function loadHistoricalEdition(year: number): Promise<HistoricalArchiveDocument> {
  const cached = editionCache.get(year);
  if (cached) return cached;

  const request = fetch(historicalEditionPath(year))
    .then(response => {
      if (!response.ok) throw new Error(`Unable to load historical World Cup ${year} archive (${response.status}).`);
      return response.json() as Promise<HistoricalArchiveDocument>;
    })
    .catch(error => {
      editionCache.delete(year);
      throw error;
    });

  editionCache.set(year, request);
  return request;
}
