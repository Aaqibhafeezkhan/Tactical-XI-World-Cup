import { describe, expect, it } from 'vitest';
import { autoArrange, validateLineup } from '../utils';
import { FORMATION_SPECS, type Player } from '../types';
import { simulateMatch } from './simulation';

const players: Player[] = [
  {id:'g1',name:'Keeper',teamId:'1',position:'GK',preferredPositions:['GK'],rating:80},
  ...Array.from({length:4},(_,i)=>({id:`d${i}`,name:`Def${i}`,teamId:'1',position:'DEF' as const,preferredPositions:['DEF' as const],rating:78+i})),
  ...Array.from({length:4},(_,i)=>({id:`m${i}`,name:`Mid${i}`,teamId:'1',position:'MID' as const,preferredPositions:['MID' as const],rating:79+i})),
  ...Array.from({length:3},(_,i)=>({id:`f${i}`,name:`Fwd${i}`,teamId:'1',position:'FWD' as const,preferredPositions:['FWD' as const],rating:81+i})),
];

describe('formation and lineup rules',()=>{
  it('defines eleven slots for every supported formation',()=>{for(const spec of Object.values(FORMATION_SPECS))expect(spec).toHaveLength(11);});
  it('auto-arranges a valid 4-3-3',()=>{const lineup=autoArrange(players.map(p=>p.id),'4-3-3',players);expect(lineup).toHaveLength(11);expect(validateLineup(lineup,players,'1').valid).toBe(true);});
  it('rejects duplicates',()=>{const lineup=autoArrange(players.map(p=>p.id),'4-3-3',players);expect(validateLineup([...lineup,lineupsFirst(lineup)],players,'1').valid).toBe(false);});
});

describe('simulation engine',()=>{
  it('returns bounded plausible match stats',()=>{const lineup=autoArrange(players.map(p=>p.id),'4-3-3',players);const result=simulateMatch({id:'1',name:'Alpha',code:'ALP',group:'A',confederation:'Test',rating:1900},{id:'2',name:'Beta',code:'BET',group:'B',confederation:'Test',rating:1880},{formation:'4-3-3',players:lineup,tactics:{possession:60,pressing:70,defensiveLine:65,width:55,tempo:60,attackingRisk:52}},{formation:'4-3-3',preset:'Balanced',tactics:{possession:50,pressing:50,defensiveLine:52,width:52,tempo:52,attackingRisk:48}},players,1);expect(result.score[0]).toBeGreaterThanOrEqual(0);expect(result.score[0]).toBeLessThanOrEqual(5);expect(result.stats.possession[0]+result.stats.possession[1]).toBe(100);expect(result.stats.xg[0]).toBeGreaterThan(0);expect(result.ratings).toHaveLength(11);expect(result.context.mode).toBe('current');expect(result.assumptions.length).toBeGreaterThan(1);});
  it('keeps historical context explicit',()=>{const lineup=autoArrange(players.map(p=>p.id),'4-3-3',players);const result=simulateMatch({id:'1',name:'Alpha',code:'ALP',group:'A',confederation:'Test',rating:1900},{id:'2',name:'Beta',code:'BET',group:'B',confederation:'Test',rating:1880},{formation:'4-3-3',players:lineup,tactics:{possession:60,pressing:70,defensiveLine:65,width:55,tempo:60,attackingRisk:52}},{formation:'4-3-3',preset:'Balanced',tactics:{possession:50,pressing:50,defensiveLine:52,width:52,tempo:52,attackingRisk:48}},players,1,{year:1954,mode:'historical',competition:'FIFA World Cup 1954',dataBasis:'tournament-specific squad records',assumptions:['Hypothetical cross-era scenario.']});expect(result.context.year).toBe(1954);expect(result.context.mode).toBe('historical');expect(result.assumptions).toContain('Hypothetical cross-era scenario.');});});
});
function lineupsFirst(xs:any[]){return xs[0];}
