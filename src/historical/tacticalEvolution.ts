import type { HistoricalFormation, HistoricalWorldCupData } from './types';

export const ERA_BUCKETS = [
  { id: 'pre-1960', label: 'Pre-1960', from: 1930, to: 1959 },
  { id: '1960s-70s', label: '1960s–70s', from: 1960, to: 1979 },
  { id: '1980s-90s', label: '1980s–90s', from: 1980, to: 1999 },
  { id: 'modern', label: 'Modern', from: 2000, to: 2099 },
] as const;

export type EraBucketId = typeof ERA_BUCKETS[number]['id'];

export function eraBucketForYear(year: number): EraBucketId | null {
  return ERA_BUCKETS.find(bucket => year >= bucket.from && year <= bucket.to)?.id ?? null;
}

export function formationFamily(name: string): string {
  return name.trim().replace(/\s+/g, '').replace(/-+/g, '-');
}

function lineCounts(name: string): number[] {
  return formationFamily(name).split('-').map(Number).filter(Number.isFinite);
}

export interface FormationProfile {
  formation: string;
  appearances: number;
  share: number;
  defenders: number;
  midfielders: number;
  forwards: number;
  width: number;
  verticalSpread: number;
}

export interface EraTacticalProfile {
  id: EraBucketId;
  label: string;
  totalFormations: number;
  formations: FormationProfile[];
}

function profileForFormation(formation: HistoricalFormation, appearances: number, total: number): FormationProfile {
  const lines = lineCounts(formation.name);
  const positions = formation.positions;
  const width = positions.length ? positions.reduce((sum, position) => sum + Math.abs(position.x - 50) * 2, 0) / positions.length : 0;
  const verticalSpread = positions.length ? Math.max(...positions.map(position => position.y)) - Math.min(...positions.map(position => position.y)) : 0;
  return {
    formation: formationFamily(formation.name),
    appearances,
    share: total ? appearances / total : 0,
    defenders: lines[0] ?? 0,
    midfielders: lines[1] ?? 0,
    forwards: lines.slice(2).reduce((sum, value) => sum + value, 0),
    width,
    verticalSpread,
  };
}

export function aggregateProfilesFromTournamentMap(
  formations: HistoricalFormation[],
  formationOccurrences: Array<{ formationId: string; year: number }>,
): EraTacticalProfile[] {
  return ERA_BUCKETS.map(bucket => {
    const selected = formationOccurrences
      .filter(occurrence => occurrence.year >= bucket.from && occurrence.year <= bucket.to)
      .map(occurrence => formations.find(formation => formation.id === occurrence.formationId))
      .filter((formation): formation is HistoricalFormation => Boolean(formation));
    const counts = new Map<string, { formation: HistoricalFormation; count: number }>();
    selected.forEach(formation => {
      const key = formationFamily(formation.name);
      const current = counts.get(key);
      counts.set(key, current ? { formation: current.formation, count: current.count + 1 } : { formation, count: 1 });
    });
    const total = selected.length;
    return {
      id: bucket.id,
      label: bucket.label,
      totalFormations: total,
      formations: [...counts.values()].map(item => profileForFormation(item.formation, item.count, total)).sort((a, b) => b.appearances - a.appearances || a.formation.localeCompare(b.formation)),
    };
  });
}

export function championFormationProfiles(data: HistoricalWorldCupData): Array<{ year: number; champion: string; formations: FormationProfile[] }> {
  return data.tournaments.filter(tournament => tournament.status === 'completed').flatMap(tournament => {
    if (!tournament.championTeamId) return [];
    const participationIds = data.teamParticipations.filter(item => item.tournamentId === tournament.id && item.teamId === tournament.championTeamId).map(item => item.id);
    const formations = data.lineups
      .filter(lineup => participationIds.includes(lineup.teamParticipationId) && lineup.formationId)
      .map(lineup => data.formations.find(formation => formation.id === lineup.formationId))
      .filter((formation): formation is HistoricalFormation => Boolean(formation));
    const counts = new Map<string, { formation: HistoricalFormation; count: number }>();
    formations.forEach(formation => {
      const key = formationFamily(formation.name);
      const current = counts.get(key);
      counts.set(key, current ? { formation: current.formation, count: current.count + 1 } : { formation, count: 1 });
    });
    const total = formations.length;
    return [{ year: tournament.year, champion: tournament.finalStandings?.[0] ?? 'Champion unavailable', formations: [...counts.values()].map(item => profileForFormation(item.formation, item.count, total)).sort((a, b) => b.appearances - a.appearances) }];
  });
}

export function teamFormationProfiles(data: HistoricalWorldCupData): Array<{ teamParticipationId: string; teamName: string; year: number; formations: FormationProfile[] }> {
  return data.teamParticipations.flatMap(participation => {
    const tournament = data.tournaments.find(item => item.id === participation.tournamentId);
    if (!tournament) return [];
    const formations = data.lineups
      .filter(lineup => lineup.teamParticipationId === participation.id && lineup.formationId)
      .map(lineup => data.formations.find(formation => formation.id === lineup.formationId))
      .filter((formation): formation is HistoricalFormation => Boolean(formation));
    const counts = new Map<string, { formation: HistoricalFormation; count: number }>();
    formations.forEach(formation => {
      const key = formationFamily(formation.name);
      const current = counts.get(key);
      counts.set(key, current ? { formation: current.formation, count: current.count + 1 } : { formation, count: 1 });
    });
    const total = formations.length;
    return [{ teamParticipationId: participation.id, teamName: participation.teamName, year: tournament.year, formations: [...counts.values()].map(item => profileForFormation(item.formation, item.count, total)).sort((a, b) => b.appearances - a.appearances) }];
  });
}
