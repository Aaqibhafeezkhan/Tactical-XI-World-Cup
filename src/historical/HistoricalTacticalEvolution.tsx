import { useEffect, useMemo, useRef, useState } from 'react';
import { navigateHistorical } from './navigation';
import { HISTORICAL_TOURNAMENTS } from './catalog';
import type { HistoricalWorldCupData } from './types';
import { aggregateProfilesFromTournamentMap, championFormationProfiles, teamFormationProfiles } from './tacticalEvolution';

const years = HISTORICAL_TOURNAMENTS.filter(tournament => tournament.status === 'completed').map(tournament => tournament.year);

export default function HistoricalTacticalEvolution({ onBack, initialYear = 2022 }: { onBack: () => void; initialYear?: number }) {
  const [data, setData] = useState<HistoricalWorldCupData | null>(null);
  const [error, setError] = useState('');
  const [teamQuery, setTeamQuery] = useState('');
  const [year, setYear] = useState(initialYear);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => mainRef.current?.focus());
  }, [year]);

  useEffect(() => {
    fetch('/data/historicalWorldCup.json')
      .then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
      .then(setData)
      .catch(() => setError('Historical tactical records are unavailable in this build. No formation or lineup evidence has been inferred.'));
  }, []);

  const formationOccurrences = useMemo(() => data ? data.lineups.flatMap(lineup => {
    if (!lineup.formationId) return [];
    const participation = data.teamParticipations.find(item => item.id === lineup.teamParticipationId);
    const tournament = participation ? data.tournaments.find(item => item.id === participation.tournamentId) : undefined;
    return tournament ? [{ formationId: lineup.formationId, year: tournament.year }] : [];
  }) : [], [data]);

  const eraProfiles = useMemo(() => data ? aggregateProfilesFromTournamentMap(data.formations, formationOccurrences) : [], [data, formationOccurrences]);
  const champions = useMemo(() => data ? championFormationProfiles(data) : [], [data]);
  const teams = useMemo(() => {
    if (!data) return [];
    const q = teamQuery.trim().toLowerCase();
    return teamFormationProfiles(data).filter(profile => profile.year === year && (!q || profile.teamName.toLowerCase().includes(q)));
  }, [data, teamQuery, year]);
  const selectedEra = eraProfiles.find(profile => profile.id === (year < 1960 ? 'pre-1960' : year < 1980 ? '1960s-70s' : year < 2000 ? '1980s-90s' : 'modern'));

  return <div style={{minHeight:'100vh',background:'#07120f',color:'#eef8f3',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
    <header className="historical-header" style={{height:72,borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',background:'#081410'}}>
      <div><div style={{fontSize:15,fontWeight:900,letterSpacing:'.16em'}}>TACTICAL XI</div><div style={{fontSize:9,color:'#7f968a',letterSpacing:'.18em',marginTop:4}}>TACTICAL EVOLUTION & COMPARISON</div></div>
      <button aria-label="Return to historical tournament explorer" onClick={onBack} style={{border:'1px solid #264136',background:'#0b1713',color:'#9cefc0',borderRadius:8,padding:'8px 12px',cursor:'pointer'}}>← Historical explorer</button>
    </header>
    <main ref={mainRef} className="historical-main" style={{maxWidth:1180,margin:'0 auto',padding:28}} tabIndex={-1} aria-labelledby="historical-evolution-title">
      <div style={{marginBottom:20}}>
        <div style={{fontSize:9,letterSpacing:'.18em',color:'#7f968a',fontWeight:800}}>PHASE 7</div>
        <h1 id="historical-evolution-title" style={{fontSize:30,margin:'6px 0'}}>How World Cup structures changed</h1>
        <p style={{fontSize:11,color:'#8ea69b',lineHeight:1.6,maxWidth:760}}>Formation frequency and structure signals are derived only from imported historical lineup/formation records. They are not universal claims about football in an era.</p>
      </div>
      {error ? <section role="alert" style={{padding:20,border:'1px solid rgba(245,184,88,.18)',borderRadius:14,background:'rgba(245,184,88,.05)',color:'#d6b978'}}><strong>Historical tactical evidence unavailable</strong><p style={{margin:'8px 0 0',lineHeight:1.6}}>{error}</p></section> : !data ? <div role="status" aria-live="polite" style={{padding:20,color:'#8ea69b'}}>Loading historical tactical records…</div> : <>
        <section style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,background:'#0a1713',padding:18,marginBottom:14}}>
          <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800,marginBottom:12}}>FORMATION FAMILIES BY ERA</div>
          <div className="historical-era-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:9}}>
            {eraProfiles.map(era => <article key={era.id} style={{padding:12,border:'1px solid rgba(255,255,255,.06)',borderRadius:10}}>
              <strong>{era.label}</strong><div style={{fontSize:22,fontWeight:900,marginTop:5}}>{era.totalFormations}</div><div style={{fontSize:9,color:'#71877d'}}>imported lineup formations</div>
              {era.formations.slice(0,4).map(profile => <div key={profile.formation} style={{display:'flex',justifyContent:'space-between',fontSize:10,marginTop:8}}><span>{profile.formation}</span><span>{Math.round(profile.share*100)}%</span></div>)}
              {!era.totalFormations && <div style={{fontSize:9,color:'#6d8178',marginTop:8}}>No formation records available.</div>}
            </article>)}
          </div>
        </section>
        <section style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,background:'#0a1713',padding:18,marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:12}}>
            <div><div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800}}>TEAM TACTICAL PROFILES</div><div style={{fontSize:10,color:'#71877d',marginTop:4}}>Formation usage for teams with tournament-specific lineup evidence.</div></div>
            <select value={year} onChange={e=>{const nextYear=Number(e.target.value);setYear(nextYear);setTeamQuery('');navigateHistorical({view:'evolution',year:nextYear})}} style={{background:'#07120f',border:'1px solid #264136',color:'#eef8f3',padding:'9px',borderRadius:8}}>{years.map(value=><option key={value}>{value}</option>)}</select>
          </div>
          <input value={teamQuery} onChange={e=>setTeamQuery(e.target.value)} placeholder="Search team" style={{background:'#07120f',border:'1px solid #264136',color:'#eef8f3',padding:'10px 12px',borderRadius:9,width:240}} />
          <div className="historical-profile-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:9,marginTop:12}}>
            {teams.map(team => <article key={team.teamParticipationId} style={{padding:13,border:'1px solid rgba(255,255,255,.06)',borderRadius:11,background:'#081410'}}><strong>{team.teamName}</strong><div style={{fontSize:9,color:'#71877d',marginTop:5}}>{team.year} · {team.formations.length} formation families</div>{team.formations.slice(0,5).map(profile => <div key={profile.formation} style={{marginTop:7,fontSize:10,display:'flex',justifyContent:'space-between'}}><span>{profile.formation}</span><span>{Math.round(profile.share*100)}%</span></div>)}</article>)}
          </div>
          {!teams.length && <div role="status" style={{padding:22,textAlign:'center',color:'#71877d',marginTop:10}}>No team formation records are available for this edition.</div>}
        </section>
        <section style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,background:'#0a1713',padding:18}}>
          <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800,marginBottom:10}}>CHAMPION TACTICAL PROFILES</div>
          {champions.length ? <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:9}}>{champions.map(champion => <article key={champion.year} style={{padding:12,border:'1px solid rgba(255,255,255,.06)',borderRadius:10}}><strong>{champion.year}</strong><div style={{fontSize:10,color:'#b9ffd2',marginTop:5}}>{champion.champion}</div>{champion.formations.slice(0,3).map(profile => <div key={profile.formation} style={{fontSize:10,display:'flex',justifyContent:'space-between',marginTop:7}}><span>{profile.formation}</span><span>{Math.round(profile.share*100)}%</span></div>)}{!champion.formations.length && <div style={{fontSize:9,color:'#71877d',marginTop:7}}>No formation evidence.</div>}</article>)}</div> : <div style={{padding:22,color:'#71877d'}}>No champion lineup/formation records are available in the imported historical dataset.</div>}
        </section>
      </>}
      <p style={{fontSize:9,color:'#526a60',lineHeight:1.6,marginTop:14}}>Methodology: formation family frequency is derived from imported lineups. Coordinate-based width and vertical-spread measures are descriptive signals, not official tactical ratings.</p>
    </main>
  </div>;
}
