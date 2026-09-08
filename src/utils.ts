import type { Formation, Position, Role } from './types';
import { FORMATION_SPECS } from './types';

export function slotsForFormation(formation: Formation) { return FORMATION_SPECS[formation].map((slot,index)=>({...slot,index})); }
export function roleForSlot(position: Position, index: number): Role {
  if(position==='GK') return index===0?'Goalkeeper':'Sweeper Keeper';
  if(position==='DEF') return index<2||index>3?'Full Back':'Central Defender';
  if(position==='MID') return index%3===0?'Box to Box':index%3===1?'Central Midfielder':'Advanced Playmaker';
  return index===1?'Advanced Forward':index===0?'Winger':'Inside Forward';
}
export function autoArrange(playerIds:string[],formation:Formation,players:{id:string;position:Position;preferredPositions:Position[];rating:number}[]){
  const pool=new Map(players.map(p=>[p.id,p]));const selected=playerIds.map(id=>pool.get(id)).filter(Boolean) as typeof players;const slots=slotsForFormation(formation);const used=new Set<string>();
  return slots.map((slot,i)=>{const candidate=selected.filter(p=>!used.has(p.id)).sort((a,b)=>suitability(b,slot.position)-suitability(a,slot.position)||b.rating-a.rating)[0] as (typeof players)[number]|undefined;if(!candidate)return null;used.add(candidate.id);return{playerId:candidate.id,x:slot.x,y:slot.y,role:roleForSlot(slot.position,i)};}).filter(Boolean) as {playerId:string;x:number;y:number;role:Role}[];
}
function suitability(player:{position:Position;preferredPositions:Position[]},slot:Position){if(player.position===slot)return 100;if(player.preferredPositions.includes(slot))return 72;if(slot==='MID'&&player.position==='FWD')return 25;if(slot==='FWD'&&player.position==='MID')return 30;if(slot==='DEF'&&player.position==='MID')return 16;if(slot==='MID'&&player.position==='DEF')return 18;return 0;}
export function validateLineup(lineup:{playerId:string}[],players:{id:string;position:Position;teamId:string}[],teamId:string){
 const selected=lineup.map(x=>players.find(p=>p.id===x.playerId)).filter(Boolean) as typeof players;const errors:string[]=[];
 if(selected.length!==11)errors.push('Your XI needs exactly 11 players before you can simulate.');
 if(new Set(lineup.map(x=>x.playerId)).size!==lineup.length)errors.push('Your XI cannot contain duplicate players.');
 if(selected.some(p=>p.teamId!==teamId))errors.push('Every player must belong to the selected World Cup squad.');
 if(selected.filter(p=>p.position==='GK').length!==1)errors.push('Your XI must contain exactly one goalkeeper.');
 return{valid:errors.length===0,errors};
}
