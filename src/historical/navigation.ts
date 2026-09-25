import { HISTORICAL_TOURNAMENTS } from './catalog';
import type { Formation } from '../types';

export type HistoricalView = 'tournament' | 'matches' | 'evolution' | 'builder';

export interface HistoricalRoute {
  view: HistoricalView;
  year: number;
  team?: string;
  player?: string;
  opponent?: string;
  formation?: Formation;
}

const FORMATIONS: Formation[] = ['4-3-3','4-2-3-1','4-4-2','3-4-3','3-5-2','4-1-4-1','4-3-1-2','5-3-2'];

function validYear(value: number): number {
  return HISTORICAL_TOURNAMENTS.some(tournament => tournament.year === value) ? value : 2022;
}

function validView(value: string | null): HistoricalView {
  return value === 'matches' || value === 'evolution' || value === 'builder' ? value : 'tournament';
}

function validFormation(value: string | null): Formation | undefined {
  return value && FORMATIONS.includes(value as Formation) ? value as Formation : undefined;
}

export function parseHistoricalHash(hash = window.location.hash): HistoricalRoute {
  const [path, query = ''] = hash.replace(/^#/, '').split('?', 2);
  if (path !== 'history') return { view: 'tournament', year: 2022 };

  const params = new URLSearchParams(query);
  return {
    view: validView(params.get('view')),
    year: validYear(Number(params.get('year')) || 2022),
    team: params.get('team') || undefined,
    player: params.get('player') || undefined,
    opponent: params.get('opponent') || undefined,
    formation: validFormation(params.get('formation')),
  };
}

export function buildHistoricalHash(route: HistoricalRoute): string {
  const params = new URLSearchParams({ year: String(validYear(route.year)) });
  if (route.view !== 'tournament') params.set('view', route.view);
  if (route.team) params.set('team', route.team);
  if (route.player) params.set('player', route.player);
  if (route.opponent) params.set('opponent', route.opponent);
  if (route.formation) params.set('formation', route.formation);
  return '#history?' + params.toString();
}

export function navigateHistorical(route: HistoricalRoute): void {
  window.location.hash = buildHistoricalHash(route);
}
