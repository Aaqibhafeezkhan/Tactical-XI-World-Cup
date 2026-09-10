import type { HistoricalTournament, Provenance } from './types';

const FIFA_PROVENANCE: Provenance = {
  sourceName: 'FIFA World Cup',
  sourceUrl: 'https://www.fifa.com/tournaments/mens/worldcup',
  retrievedAt: '2026-09-10',
  asOf: '2026-09-10',
  origin: 'official',
  confidence: 'high',
};

const NOT_HELD_PROVENANCE: Provenance = {
  ...FIFA_PROVENANCE,
  notes: 'The tournament edition was not held because of the Second World War.',
};

const tournament = (
  year: number,
  hosts: string[],
  participatingTeams: number,
  championTeamId: string | undefined,
  format: string,
  startDate?: string,
  endDate?: string,
): HistoricalTournament => ({
  id: `wc-${year}`,
  year,
  status: 'completed',
  name: `FIFA World Cup ${year}`,
  hosts: hosts.map(name => ({ name })),
  startDate,
  endDate,
  format,
  participatingTeams,
  championTeamId,
  provenance: [FIFA_PROVENANCE],
});

export const HISTORICAL_TOURNAMENTS: HistoricalTournament[] = [
  tournament(1930, ['Uruguay'], 13, 'URU', 'Group stage and knockout', '1930-07-13', '1930-07-30'),
  tournament(1934, ['Italy'], 16, 'ITA', 'Straight knockout', '1934-05-27', '1934-06-10'),
  tournament(1938, ['France'], 15, 'ITA', 'Straight knockout', '1938-06-04', '1938-06-19'),
  {
    id: 'wc-1942', year: 1942, status: 'not-held', name: 'FIFA World Cup 1942', hosts: [], format: 'Not held', participatingTeams: 0, provenance: [NOT_HELD_PROVENANCE],
  },
  {
    id: 'wc-1946', year: 1946, status: 'not-held', name: 'FIFA World Cup 1946', hosts: [], format: 'Not held', participatingTeams: 0, provenance: [NOT_HELD_PROVENANCE],
  },
  tournament(1950, ['Brazil'], 13, 'URU', 'Group stage and final group', '1950-06-24', '1950-07-16'),
  tournament(1954, ['Switzerland'], 16, 'FRG', 'Group stage and knockout', '1954-06-16', '1954-07-04'),
  tournament(1958, ['Sweden'], 16, 'BRA', 'Group stage and knockout', '1958-06-08', '1958-06-29'),
  tournament(1962, ['Chile'], 16, 'BRA', 'Group stage and knockout', '1962-05-30', '1962-06-17'),
  tournament(1966, ['England'], 16, 'ENG', 'Group stage and knockout', '1966-07-11', '1966-07-30'),
  tournament(1970, ['Mexico'], 16, 'BRA', 'Group stage and knockout', '1970-05-31', '1970-06-21'),
  tournament(1974, ['West Germany'], 16, 'FRG', 'Group stage and two-group second round', '1974-06-13', '1974-07-07'),
  tournament(1978, ['Argentina'], 16, 'ARG', 'Group stage and two-group second round', '1978-06-01', '1978-06-25'),
  tournament(1982, ['Spain'], 24, 'ITA', 'Two group stages and knockout', '1982-06-13', '1982-07-11'),
  tournament(1986, ['Mexico'], 24, 'ARG', 'Group stage and knockout', '1986-05-31', '1986-06-29'),
  tournament(1990, ['Italy'], 24, 'FRG', 'Group stage and knockout', '1990-06-08', '1990-07-08'),
  tournament(1994, ['United States'], 24, 'BRA', 'Group stage and knockout', '1994-06-17', '1994-07-17'),
  tournament(1998, ['France'], 32, 'FRA', 'Group stage and knockout', '1998-06-10', '1998-07-12'),
  tournament(2002, ['South Korea', 'Japan'], 32, 'BRA', 'Group stage and knockout', '2002-05-31', '2002-06-30'),
  tournament(2006, ['Germany'], 32, 'ITA', 'Group stage and knockout', '2006-06-09', '2006-07-09'),
  tournament(2010, ['South Africa'], 32, 'ESP', 'Group stage and knockout', '2010-06-11', '2010-07-11'),
  tournament(2014, ['Brazil'], 32, 'GER', 'Group stage and knockout', '2014-06-12', '2014-07-13'),
  tournament(2018, ['Russia'], 32, 'FRA', 'Group stage and knockout', '2018-06-14', '2018-07-15'),
  tournament(2022, ['Qatar'], 32, 'ARG', 'Group stage and knockout', '2022-11-20', '2022-12-18'),
  tournament(2026, ['Canada', 'Mexico', 'United States'], 48, 'ESP', 'Group stage, round of 32 and knockout', '2026-06-11', '2026-07-19'),
];

export function getTournament(year: number): HistoricalTournament | undefined {
  return HISTORICAL_TOURNAMENTS.find(item => item.year === year);
}
