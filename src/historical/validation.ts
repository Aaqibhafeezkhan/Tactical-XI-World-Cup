import type { HistoricalWorldCupData, Provenance } from './types';

export interface ValidationIssue {
  path: string;
  message: string;
}

const validOrigins = new Set(['official', 'reconstructed', 'derived']);
const validConfidence = new Set(['high', 'medium', 'low']);

function addProvenanceIssues(issues: ValidationIssue[], provenance: Provenance[], path: string) {
  if (!provenance.length) issues.push({ path, message: 'At least one provenance record is required.' });
  provenance.forEach((record, index) => {
    const prefix = `${path}[${index}]`;
    try { new URL(record.sourceUrl); } catch { issues.push({ path: prefix + '.sourceUrl', message: 'Source URL must be an absolute URL.' }); }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.retrievedAt)) issues.push({ path: prefix + '.retrievedAt', message: 'retrievedAt must use YYYY-MM-DD.' });
    if (record.asOf && !/^\d{4}-\d{2}-\d{2}$/.test(record.asOf)) issues.push({ path: prefix + '.asOf', message: 'asOf must use YYYY-MM-DD.' });
    if (!validOrigins.has(record.origin)) issues.push({ path: prefix + '.origin', message: 'Unknown provenance origin.' });
    if (!validConfidence.has(record.confidence)) issues.push({ path: prefix + '.confidence', message: 'Unknown provenance confidence.' });
  });
}

export function validateHistoricalData(data: HistoricalWorldCupData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tournamentIds = new Set<string>();
  const tournamentYears = new Set<number>();
  const tournamentMap = new Map(data.tournaments.map(item => [item.id, item]));
  const participationMap = new Map(data.teamParticipations.map(item => [item.id, item]));
  const playerMap = new Map(data.players.map(item => [item.id, item]));
  const matchMap = new Map(data.matches.map(item => [item.id, item]));
  const lineupMap = new Map(data.lineups.map(item => [item.id, item]));
  const formationMap = new Map(data.formations.map(item => [item.id, item]));

  data.tournaments.forEach((tournament, index) => {
    if (tournamentIds.has(tournament.id)) issues.push({ path: `tournaments[${index}].id`, message: 'Duplicate tournament ID.' });
    if (tournamentYears.has(tournament.year)) issues.push({ path: `tournaments[${index}].year`, message: 'Duplicate tournament year.' });
    tournamentIds.add(tournament.id);
    tournamentYears.add(tournament.year);
    if (tournament.status === 'not-held' && tournament.participatingTeams !== 0) issues.push({ path: `tournaments[${index}].participatingTeams`, message: 'A not-held edition cannot have participating teams.' });
    addProvenanceIssues(issues, tournament.provenance, `tournaments[${index}].provenance`);
  });

  [1942, 1946].forEach(year => {
    const tournament = data.tournaments.find(item => item.year === year);
    if (!tournament || tournament.status !== 'not-held') issues.push({ path: 'tournaments', message: `${year} must be represented explicitly as not-held.` });
  });

  data.teamParticipations.forEach((item, index) => {
    if (!tournamentMap.has(item.tournamentId)) issues.push({ path: `teamParticipations[${index}].tournamentId`, message: 'References an unknown tournament.' });
    addProvenanceIssues(issues, item.provenance, `teamParticipations[${index}].provenance`);
  });

  data.players.forEach((player, index) => {
    const participation = participationMap.get(player.teamParticipationId);
    if (!tournamentMap.has(player.tournamentId)) issues.push({ path: `players[${index}].tournamentId`, message: 'References an unknown tournament.' });
    if (!participation) issues.push({ path: `players[${index}].teamParticipationId`, message: 'References an unknown team participation.' });
    else if (participation.tournamentId !== player.tournamentId) issues.push({ path: `players[${index}].tournamentId`, message: 'Player tournament does not match team participation tournament.' });
    addProvenanceIssues(issues, player.provenance, `players[${index}].provenance`);
  });

  data.squads.forEach((squad, index) => {
    const participation = participationMap.get(squad.teamParticipationId);
    if (!tournamentMap.has(squad.tournamentId)) issues.push({ path: `squads[${index}].tournamentId`, message: 'References an unknown tournament.' });
    if (!participation) issues.push({ path: `squads[${index}].teamParticipationId`, message: 'References an unknown team participation.' });
    else if (participation.tournamentId !== squad.tournamentId) issues.push({ path: `squads[${index}].tournamentId`, message: 'Squad tournament does not match team participation tournament.' });
    squad.playerIds.forEach(playerId => {
      const player = playerMap.get(playerId);
      if (!player) issues.push({ path: `squads[${index}].playerIds`, message: `References unknown player ${playerId}.` });
      else if (player.teamParticipationId !== squad.teamParticipationId) issues.push({ path: `squads[${index}].playerIds`, message: `Player ${playerId} belongs to a different team participation.` });
    });
    addProvenanceIssues(issues, squad.provenance, `squads[${index}].provenance`);
  });

  data.matches.forEach((match, index) => {
    const home = participationMap.get(match.homeTeamParticipationId);
    const away = participationMap.get(match.awayTeamParticipationId);
    if (!tournamentMap.has(match.tournamentId)) issues.push({ path: `matches[${index}].tournamentId`, message: 'References an unknown tournament.' });
    if (!home || !away) issues.push({ path: `matches[${index}]`, message: 'Both match teams must reference known team participations.' });
    else if (home.tournamentId !== match.tournamentId || away.tournamentId !== match.tournamentId) issues.push({ path: `matches[${index}]`, message: 'Match teams must belong to the match tournament.' });
    addProvenanceIssues(issues, match.provenance, `matches[${index}].provenance`);
  });

  data.lineups.forEach((lineup, index) => {
    const match = matchMap.get(lineup.matchId);
    const participation = participationMap.get(lineup.teamParticipationId);
    if (!match) issues.push({ path: `lineups[${index}].matchId`, message: 'References an unknown match.' });
    if (!participation) issues.push({ path: `lineups[${index}].teamParticipationId`, message: 'References an unknown team participation.' });
    if (match && ![match.homeTeamParticipationId, match.awayTeamParticipationId].includes(lineup.teamParticipationId)) issues.push({ path: `lineups[${index}].teamParticipationId`, message: 'Lineup team must be one of the match teams.' });
    lineup.playerIds.forEach(playerId => {
      const player = playerMap.get(playerId);
      if (!player) issues.push({ path: `lineups[${index}].playerIds`, message: `References unknown player ${playerId}.` });
      else if (player.teamParticipationId !== lineup.teamParticipationId) issues.push({ path: `lineups[${index}].playerIds`, message: `Player ${playerId} belongs to a different team participation.` });
    });
    if (lineup.formationId && !formationMap.has(lineup.formationId)) issues.push({ path: `lineups[${index}].formationId`, message: 'References an unknown formation.' });
    addProvenanceIssues(issues, lineup.provenance, `lineups[${index}].provenance`);
  });

  data.formations.forEach((formation, index) => addProvenanceIssues(issues, formation.provenance, `formations[${index}].provenance`));
  return issues;
}
