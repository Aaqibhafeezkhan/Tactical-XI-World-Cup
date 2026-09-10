export type TournamentStatus = 'completed' | 'not-held';
export type DataOrigin = 'official' | 'reconstructed' | 'derived';
export type Confidence = 'high' | 'medium' | 'low';
export type CompetitionStage = 'group' | 'first-round' | 'round-of-16' | 'quarter-final' | 'semi-final' | 'third-place' | 'final' | 'final-group';
export type HistoricalPosition = 'GK' | 'DEF' | 'MID' | 'FWD' | 'UNKNOWN';

export interface Provenance {
  sourceName: string;
  sourceUrl: string;
  retrievedAt: string;
  asOf?: string;
  origin: DataOrigin;
  confidence: Confidence;
  notes?: string;
}

export interface TournamentHost {
  name: string;
  code?: string;
}

export interface HistoricalTournament {
  id: string;
  year: number;
  status: TournamentStatus;
  name: string;
  hosts: TournamentHost[];
  startDate?: string;
  endDate?: string;
  format: string;
  participatingTeams: number;
  championTeamId?: string;
  provenance: Provenance[];
}

export interface TeamParticipation {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  teamCode?: string;
  confederation?: string;
  finishPosition?: number;
  stageReached?: CompetitionStage;
  matchesPlayed?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  provenance: Provenance[];
}

export interface HistoricalPlayer {
  id: string;
  tournamentId: string;
  teamParticipationId: string;
  name: string;
  normalizedName?: string;
  position: HistoricalPosition;
  preferredPositions?: HistoricalPosition[];
  shirtNumber?: number;
  dateOfBirth?: string;
  modernPlayerId?: string;
  provenance: Provenance[];
}

export interface HistoricalSquad {
  id: string;
  tournamentId: string;
  teamParticipationId: string;
  playerIds: string[];
  squadSize?: number;
  provenance: Provenance[];
}

export interface HistoricalFormation {
  id: string;
  name: string;
  eraLabel?: string;
  positions: Array<{
    playerId: string;
    role?: string;
    x: number;
    y: number;
  }>;
  origin: DataOrigin;
  confidence: Confidence;
  provenance: Provenance[];
}

export interface HistoricalLineup {
  id: string;
  matchId: string;
  teamParticipationId: string;
  playerIds: string[];
  formationId?: string;
  isReconstructed: boolean;
  provenance: Provenance[];
}

export interface HistoricalMatch {
  id: string;
  tournamentId: string;
  stage: CompetitionStage;
  date?: string;
  venue?: string;
  hostCity?: string;
  homeTeamParticipationId: string;
  awayTeamParticipationId: string;
  homeScore?: number;
  awayScore?: number;
  homeScoreAfterExtraTime?: number;
  awayScoreAfterExtraTime?: number;
  homeScoreAfterPenalties?: number;
  awayScoreAfterPenalties?: number;
  lineupIds?: string[];
  provenance: Provenance[];
}

export interface HistoricalWorldCupData {
  tournaments: HistoricalTournament[];
  teamParticipations: TeamParticipation[];
  squads: HistoricalSquad[];
  players: HistoricalPlayer[];
  matches: HistoricalMatch[];
  lineups: HistoricalLineup[];
  formations: HistoricalFormation[];
}

export const HISTORICAL_TOURNAMENT_IDS = [
  'wc-1930','wc-1934','wc-1938','wc-1942','wc-1946','wc-1950','wc-1954','wc-1958','wc-1962','wc-1966','wc-1970','wc-1974','wc-1978','wc-1982','wc-1986','wc-1990','wc-1994','wc-1998','wc-2002','wc-2006','wc-2010','wc-2014','wc-2018','wc-2022','wc-2026'
] as const;
