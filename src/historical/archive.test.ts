import { describe, expect, it } from 'vitest';
import { HISTORICAL_TOURNAMENTS, HISTORICAL_TOURNAMENT_IDS } from './index';

const PLAYED_YEARS = [1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026];

describe('historical archive contract', () => {
  it('covers every played World Cup edition', () => {
    const played = HISTORICAL_TOURNAMENTS.filter(tournament => tournament.status === 'completed').map(tournament => tournament.year);
    expect(played).toEqual(PLAYED_YEARS);
    expect(HISTORICAL_TOURNAMENT_IDS).toHaveLength(25);
  });

  it('keeps the non-tournaments outside the played archive scope', () => {
    expect(HISTORICAL_TOURNAMENTS.filter(tournament => tournament.status === 'not-held').map(tournament => tournament.year)).toEqual([1942, 1946]);
  });
});
