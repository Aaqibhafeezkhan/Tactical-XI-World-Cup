import { describe, expect, it } from 'vitest';
import { HISTORICAL_TOURNAMENTS } from './catalog';

describe('historical explorer boundaries', () => {
  it('exposes all modeled editions to the explorer', () => {
    expect(HISTORICAL_TOURNAMENTS.map(t => t.year)).toEqual([1930,1934,1938,1942,1946,1950,1954,1958,1962,1966,1970,1974,1978,1982,1986,1990,1994,1998,2002,2006,2010,2014,2018,2022,2026]);
  });
  it('keeps 1942 and 1946 as not-held editions', () => {
    expect(HISTORICAL_TOURNAMENTS.filter(t => t.status === 'not-held').map(t => t.year)).toEqual([1942,1946]);
  });
});
