import { useEffect, useMemo, useState } from 'react';
import { HISTORICAL_TOURNAMENTS } from './catalog';
import type { HistoricalArchiveDocument } from './archive';

const years = HISTORICAL_TOURNAMENTS.map(t => t.year);

export default function HistoricalExplorer() {
  const [year, setYear] = useState(2022);
  const [query, setQuery] = useState('');
  const [archive, setArchive] = useState<HistoricalArchiveDocument | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/data/historicalWorldCup.json')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .then(setArchive)
      .catch(() => setError('Historical archive is not available in this build. Run npm run prepare:historical and rebuild.'));
  }, []);

  const tournament = HISTORICAL_TOURNAMENTS.find(t => t.year === year)!;
  const teams = useMemo(() => {
    if (!archive || tournament.status === 'not-held') return [];
    return archive.teamParticipations
      .filter(t => t.tournamentId === tournament.id)
      .filter(t => t.teamName.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => (a.finishPosition ?? 999) - (b.finishPosition ?? 999) || a.teamName.localeCompare(b.teamName));
  }, [archive, tournament, query]);
  const matches = archive?.matches.filter(m => m.tournamentId === tournament.id).length ?? 0;

  return <div style={{minHeight:'100vh',background:'#07120f',color:'#eef8f3',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
    <header style={{height:72,borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',background:'#081410'}}>
      <div><div style={{fontSize:15,fontWeight:900,letterSpacing:'.16em'}}>TACTICAL XI</div><div style={{fontSize:9,color:'#7f968a',letterSpacing:'.18em',marginTop:4}}>HISTORICAL WORLD CUP EXPLORER</div></div>
      <a href="#" style={{color:'#9cefc0',fontSize:11,textDecoration:'none'}}>Back to Tactical XI</a>
    </header>
    <main style={{maxWidth:1180,margin:'0 auto',padding:28}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'end',marginBottom:22}}>
        <div><div style={{fontSize:9,letterSpacing:'.18em',color:'#7f968a',fontWeight:800}}>TOURNAMENT ARCHIVE</div><h1 style={{fontSize:30,margin:'6px 0 0',letterSpacing:'-.04em'}}>World Cup {year}</h1><p style={{color:'#8ea69b',fontSize:12,maxWidth:650,lineHeight:1.6,margin:'8px 0 0'}}>Browse tournament-specific teams and archived match context without touching the modern 2026 player registry.</p></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>{years.map(y=><button key={y} onClick={()=>{setYear(y);setQuery('')}} style={{border:'1px solid '+(y===year?'#63dc98':'#1b3027'),background:y===year?'#12301f':'#0b1713',color:y===year?'#b9ffd2':'#9bb0a6',borderRadius:8,padding:'7px 9px',fontSize:10,cursor:'pointer'}}>{y}</button>)}</div>
      </div>
      <section style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,background:'#0a1713',padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:16,flexWrap:'wrap'}}>
          <div><strong style={{fontSize:16}}>{tournament.name}</strong><div style={{fontSize:10,color:'#71877d',marginTop:4}}>{tournament.hosts.map(h=>h.name).join(', ') || 'No host: not held'} · {tournament.format}</div></div>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search teams" disabled={tournament.status==='not-held'} style={{background:'#07120f',border:'1px solid #22392e',color:'#eef8f3',borderRadius:9,padding:'10px 12px',outline:'none',width:220}} />
        </div>
        {tournament.status==='not-held' ? <div style={{padding:'34px 10px',textAlign:'center',color:'#d6b978',background:'rgba(245,184,88,.05)',border:'1px solid rgba(245,184,88,.12)',borderRadius:12}}>This edition was not held. No teams, players, or matches are imported.</div> : error ? <div style={{padding:18,color:'#e6c783',background:'rgba(245,184,88,.05)',borderRadius:12}}>{error}</div> : !archive ? <div style={{padding:18,color:'#8ea69b'}}>Loading historical archive…</div> : <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>{[['Teams',String(teams.length)],['Matches',String(matches)],['Champion',tournament.finalStandings?.[0] ?? 'Unknown']].map(([label,value])=><div key={label} style={{padding:13,border:'1px solid rgba(255,255,255,.06)',borderRadius:10}}><div style={{fontSize:9,color:'#678076'}}>{label}</div><div style={{fontSize:16,fontWeight:850,marginTop:4}}>{value}</div></div>)}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:9}}>{teams.map(team=><article key={team.id} style={{padding:13,border:'1px solid rgba(255,255,255,.06)',borderRadius:11,background:'#081410'}}><strong>{team.teamName}</strong><div style={{fontSize:10,color:'#71877d',marginTop:7}}>{team.matchesPlayed ?? 0} matches · {team.wins ?? 0}W {team.draws ?? 0}D {team.losses ?? 0}L</div><div style={{fontSize:10,color:'#8fa79b',marginTop:4}}>{team.goalsFor ?? 0} GF · {team.goalsAgainst ?? 0} GA</div>{team.stageReached && <div style={{fontSize:9,color:'#9cefc0',marginTop:8}}>Stage: {team.stageReached}</div>}</article>)}</div>
          {teams.length===0 && <div style={{padding:24,textAlign:'center',color:'#71877d'}}>No participating team matches that search.</div>}
        </>}
      </section>
      <p style={{fontSize:9,color:'#526a60',lineHeight:1.6,marginTop:14}}>Historical facts and archived match records are sourced data. Player-level historical records are not inferred from the current 2026 roster.</p>
    </main>
  </div>;
}
