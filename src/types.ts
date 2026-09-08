export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type Formation = '4-3-3' | '4-2-3-1' | '4-4-2' | '3-4-3' | '3-5-2' | '4-1-4-1' | '4-3-1-2' | '5-3-2';
export type Role = 'Goalkeeper' | 'Sweeper Keeper' | 'Full Back' | 'Wing Back' | 'Inverted Full Back' | 'Ball Playing Defender' | 'Central Defender' | 'Defensive Midfielder' | 'Deep Lying Playmaker' | 'Box to Box' | 'Central Midfielder' | 'Advanced Playmaker' | 'Attacking Midfielder' | 'Winger' | 'Inverted Winger' | 'Inside Forward' | 'Wide Forward' | 'False 9' | 'Advanced Forward' | 'Poacher';

export interface Team {
  id: string; name: string; code: string; group: string; confederation: string; rating: number;
}
export interface Player {
  id: string; name: string; teamId: string; position: Position; preferredPositions: Position[]; rating: number; jerseyNumber?: number;
}
export interface LineupPlayer {
  playerId: string; x: number; y: number; role: Role;
}
export interface Tactics {
  possession: number; pressing: number; defensiveLine: number; width: number; tempo: number; attackingRisk: number;
}
export interface TacticalSetup {
  formation: Formation; players: LineupPlayer[]; tactics: Tactics;
}
export type OpponentPreset = 'Balanced' | 'Possession' | 'High Press' | 'Low Block' | 'Counter Attack' | 'Direct Football';
export interface OpponentSetup {
  formation: Formation; preset: OpponentPreset; tactics: Tactics;
}
export interface MatchStats {
  possession: [number, number]; shots: [number, number]; shotsOnTarget: [number, number]; xg: [number, number];
  dangerousAttacks: [number, number]; highTurnovers: [number, number]; bigChances: [number, number]; fouls: [number, number]; corners: [number, number];
}
export interface MatchEvent { minute: number; team: 0 | 1; type: 'goal' | 'yellow' | 'chance' | 'moment'; text: string; }
export interface PlayerRating { playerId: string; rating: number; contribution: string; }
export interface SimulationResult {
  score: [number, number]; stats: MatchStats; events: MatchEvent[]; ratings: PlayerRating[]; playerOfMatch: string;
  verdict: string[]; tacticalEdge: string[]; seed: number;
}
export interface WorldCupData { teams: Team[]; players: Player[]; generatedAt: string; source: string; sourceRows: number; }

export const FORMATION_SPECS: Record<Formation, { position: Position; x: number; y: number }[]> = {
  '4-3-3': [
    {position:'GK',x:50,y:90},{position:'DEF',x:14,y:70},{position:'DEF',x:38,y:74},{position:'DEF',x:62,y:74},{position:'DEF',x:86,y:70},
    {position:'MID',x:28,y:52},{position:'MID',x:50,y:58},{position:'MID',x:72,y:52},{position:'FWD',x:16,y:28},{position:'FWD',x:50,y:20},{position:'FWD',x:84,y:28}],
  '4-2-3-1': [
    {position:'GK',x:50,y:90},{position:'DEF',x:14,y:70},{position:'DEF',x:38,y:74},{position:'DEF',x:62,y:74},{position:'DEF',x:86,y:70},
    {position:'MID',x:35,y:56},{position:'MID',x:65,y:56},{position:'MID',x:18,y:34},{position:'MID',x:50,y:32},{position:'MID',x:82,y:34},{position:'FWD',x:50,y:17}],
  '4-4-2': [
    {position:'GK',x:50,y:90},{position:'DEF',x:14,y:70},{position:'DEF',x:38,y:74},{position:'DEF',x:62,y:74},{position:'DEF',x:86,y:70},
    {position:'MID',x:17,y:48},{position:'MID',x:39,y:52},{position:'MID',x:61,y:52},{position:'MID',x:83,y:48},{position:'FWD',x:39,y:23},{position:'FWD',x:61,y:23}],
  '3-4-3': [
    {position:'GK',x:50,y:90},{position:'DEF',x:25,y:72},{position:'DEF',x:50,y:76},{position:'DEF',x:75,y:72},
    {position:'MID',x:15,y:48},{position:'MID',x:37,y:54},{position:'MID',x:63,y:54},{position:'MID',x:85,y:48},{position:'FWD',x:18,y:25},{position:'FWD',x:50,y:19},{position:'FWD',x:82,y:25}],
  '3-5-2': [
    {position:'GK',x:50,y:90},{position:'DEF',x:25,y:72},{position:'DEF',x:50,y:76},{position:'DEF',x:75,y:72},
    {position:'MID',x:13,y:50},{position:'MID',x:31,y:53},{position:'MID',x:50,y:57},{position:'MID',x:69,y:53},{position:'MID',x:87,y:50},{position:'FWD',x:39,y:24},{position:'FWD',x:61,y:24}],
  '4-1-4-1': [
    {position:'GK',x:50,y:90},{position:'DEF',x:14,y:70},{position:'DEF',x:38,y:74},{position:'DEF',x:62,y:74},{position:'DEF',x:86,y:70},{position:'MID',x:50,y:62},
    {position:'MID',x:15,y:40},{position:'MID',x:38,y:44},{position:'MID',x:62,y:44},{position:'MID',x:85,y:40},{position:'FWD',x:50,y:20}],
  '4-3-1-2': [
    {position:'GK',x:50,y:90},{position:'DEF',x:14,y:70},{position:'DEF',x:38,y:74},{position:'DEF',x:62,y:74},{position:'DEF',x:86,y:70},{position:'MID',x:28,y:52},{position:'MID',x:50,y:58},{position:'MID',x:72,y:52},
    {position:'MID',x:50,y:33},{position:'FWD',x:40,y:20},{position:'FWD',x:60,y:20}],
  '5-3-2': [
    {position:'GK',x:50,y:90},{position:'DEF',x:10,y:68},{position:'DEF',x:30,y:74},{position:'DEF',x:50,y:77},{position:'DEF',x:70,y:74},{position:'DEF',x:90,y:68},{position:'MID',x:30,y:50},{position:'MID',x:50,y:55},{position:'MID',x:70,y:50},{position:'FWD',x:40,y:23},{position:'FWD',x:60,y:23}],
};

export const ROLE_OPTIONS: Record<Position, Role[]> = {
  GK: ['Goalkeeper','Sweeper Keeper'],
  DEF: ['Full Back','Wing Back','Inverted Full Back','Ball Playing Defender','Central Defender'],
  MID: ['Defensive Midfielder','Deep Lying Playmaker','Box to Box','Central Midfielder','Advanced Playmaker','Attacking Midfielder'],
  FWD: ['Winger','Inverted Winger','Inside Forward','Wide Forward','False 9','Advanced Forward','Poacher'],
};
