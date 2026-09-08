import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'data', 'worldCup2026.json');
const TEAM_URL = 'https://raw.githubusercontent.com/mominullptr/FIFA-World-Cup-2026-Dataset/main/teams.csv';
const PLAYER_URL = 'https://raw.githubusercontent.com/mominullptr/FIFA-World-Cup-2026-Dataset/main/squads_and_players.csv';

const fallbackTeams = ['Canada','Mexico','USA','Australia','Iraq','IR Iran','Japan','Jordan','Korea Republic','Qatar','Saudi Arabia','Uzbekistan','Algeria','Cabo Verde','Congo DR',"Côte d'Ivoire",'Egypt','Ghana','Morocco','Senegal','South Africa','Tunisia','Curaçao','Haiti','Panama','Argentina','Brazil','Colombia','Ecuador','Paraguay','Uruguay','New Zealand','Austria','Belgium','Bosnia and Herzegovina','Croatia','Czechia','England','France','Germany','Netherlands','Norway','Portugal','Scotland','Spain','Sweden','Switzerland','Türkiye'];

function parseLine(line) {
  const cells=[]; let cur=''; let quoted=false;
  for(let i=0;i<line.length;i++){ const ch=line[i]; if(ch==='"'){ if(quoted && line[i+1]==='"'){cur+='"';i++;} else quoted=!quoted; } else if(ch===','&&!quoted){cells.push(cur);cur='';} else cur+=ch; }
  cells.push(cur); return cells;
}
function csv(text){ const rows=text.trim().split(/\r?\n/); const headers=parseLine(rows.shift()); return rows.map(r=>Object.fromEntries(parseLine(r).map((v,i)=>[headers[i],v]))); }
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function rating(row){
  const market=Math.log10(Math.max(250000,Number(row.market_value_eur)||250000));
  const caps=Math.min(120,Number(row.caps)||0)*0.025;
  const goals=Math.min(60,Number(row.goals)||0)*0.04;
  const pos=row.position==='GK'?0.5:row.position==='DEF'?1.5:row.position==='MID'?2:2.8;
  return Math.round(clamp(58 + market*3.05 + caps + goals + pos, 64, 91));
}
function preferred(position){ return position==='GK'?['GK']:position==='DEF'?['DEF','MID']:position==='MID'?['MID','FWD','DEF']:['FWD','MID']; }

async function main(){
  await fs.mkdir(path.dirname(OUT),{recursive:true});
  if(!process.env.FORCE_DATA_REFRESH){
    try { const stat=await fs.stat(OUT); if(stat.size>50000){ console.log('Using existing local World Cup data snapshot.'); return; } } catch{}
  }
  const [teamsRes, playersRes] = await Promise.all([fetch(TEAM_URL), fetch(PLAYER_URL)]);
  if(!teamsRes.ok || !playersRes.ok) throw new Error('Unable to fetch the World Cup 2026 source registry. Connect to the internet once, then rerun npm run dev.');
  const teamRows=csv(await teamsRes.text()); const playerRows=csv(await playersRes.text());
  const names=new Set(teamRows.map(t=>t.team_name));
  for(const name of fallbackTeams) if(!names.has(name)) console.warn(`Missing expected 2026 team from source: ${name}`);
  const teams=teamRows.map(t=>({id:t.team_id,name:t.team_name,code:t.fifa_code,group:t.group_letter,confederation:t.confederation,rating:Number(t.elo_rating)||1700}));
  const players=playerRows.map(p=>({id:`p-${p.player_id}`,name:p.player_name,teamId:p.team_id,position:p.position,preferredPositions:preferred(p.position),rating:rating(p),jerseyNumber:undefined}));
  if(teams.length!==48 || players.length!==1248) throw new Error(`Expected 48 teams and 1248 players, received ${teams.length} teams and ${players.length} players.`);
  const payload={schemaVersion:1,source:'FIFA World Cup 2026 final-squad scope; player registry snapshot sourced from Mominullptr/FIFA-World-Cup-2026-Dataset',teams,players,sourceRows:players.length};
  await fs.writeFile(OUT,JSON.stringify(payload));
  console.log(`Saved ${teams.length} teams and ${players.length} players to ${path.relative(ROOT,OUT)}.`);
}
main().catch(err=>{console.error(err);process.exit(1);});
