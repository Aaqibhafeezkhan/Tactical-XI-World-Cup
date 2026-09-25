import { useEffect, useMemo, useRef, useState } from 'react';
import type { HistoricalArchiveDocument } from './archive';
import type { HistoricalMatch, TeamParticipation } from './types';

type Props = { archive: HistoricalArchiveDocument; tournamentId: string; onBackToTournament: () => void };

const stageLabels: Record<string,string> = {
  group:'Group stage','first-round':'First round','round-of-32':'Round of 32','round-of-16':'Round of 16',
  'quarter-final':'Quarter-final','semi-final':'Semi-final','third-place':'Third place','final':'Final','final-group':'Final group',
};

export default function HistoricalMatchExplorer({ archive, tournamentId, onBackToTournament }: Props) {
  const [stage, setStage] = useState('all');
  const [query, setQuery] = useState('');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => mainRef.current?.focus());
  }, [tournamentId]);
  const participation = useMemo(() => new Map(archive.teamParticipations.filter(t=>t.tournamentId===tournamentId).map(t=>[t.id,t])), [archive,tournamentId]);
  const matches = useMemo(() => archive.matches.filter(m=>m.tournamentId===tournamentId).filter(m=>stage==='all'||m.stage===stage).filter(m=>{
    if(!query.trim()) return true;
    const q=query.trim().toLowerCase();
    return participation.get(m.homeTeamParticipationId)?.teamName.toLowerCase().includes(q)||participation.get(m.awayTeamParticipationId)?.teamName.toLowerCase().includes(q);
  }), [archive,tournamentId,stage,query,participation]);
  const stages = useMemo(() => [...new Set(archive.matches.filter(m=>m.tournamentId===tournamentId).map(m=>m.stage))], [archive,tournamentId]);
  const label=(p:TeamParticipation|undefined)=>p?.teamName ?? 'Unknown team';
  const score=(m:HistoricalMatch)=>m.homeScore==null||m.awayScore==null?'Result unavailable':`${m.homeScore} — ${m.awayScore}${m.homeScoreAfterPenalties!=null||m.awayScoreAfterPenalties!=null?' pens':''}`;
  return <div style={{minHeight:'100vh',background:'#07120f',color:'#eef8f3',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
    <header className="historical-header" style={{height:72,borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',background:'#081410'}}>
      <div><div style={{fontSize:15,fontWeight:900,letterSpacing:'.16em'}}>TACTICAL XI</div><div style={{fontSize:9,color:'#7f968a',letterSpacing:'.18em',marginTop:4}}>HISTORICAL MATCH EXPLORER</div></div>
      <button aria-label="Return to tournament context" onClick={onBackToTournament} style={{border:'1px solid #264136',background:'#0b1713',color:'#9cefc0',borderRadius:8,padding:'8px 12px',cursor:'pointer'}}>← Tournament context</button>
    </header>
    <main ref={mainRef} className="historical-main" style={{maxWidth:1180,margin:'0 auto',padding:28}} tabIndex={-1} aria-labelledby="historical-match-title">
      <div style={{marginBottom:20}}><div style={{fontSize:9,letterSpacing:'.18em',color:'#7f968a',fontWeight:800}}>RECORDED FIXTURES</div><h1 id="historical-match-title" style={{fontSize:30,margin:'6px 0'}}>World Cup {archive.tournaments.find(t=>t.year===Number(tournamentId.replace('wc-','')))?.year ?? ''} matches</h1><p style={{fontSize:11,color:'#8ea69b',lineHeight:1.6,margin:0}}>Archived competition records only. Scores and match context below are not simulation outputs.</p></div>
      <div className="historical-controls" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search teams" style={{background:'#0b1713',border:'1px solid #264136',color:'#eef8f3',padding:'10px 12px',borderRadius:9,width:220}} />
        <select value={stage} onChange={e=>setStage(e.target.value)} style={{background:'#0b1713',border:'1px solid #264136',color:'#eef8f3',padding:'10px 12px',borderRadius:9}}><option value="all">All stages</option>{stages.map(s=><option key={s} value={s}>{stageLabels[s]??s}</option>)}</select>
      </div>
      <section className="historical-match-list" style={{display:'grid',gap:8}}>{matches.map(m=>{const home=participation.get(m.homeTeamParticipationId),away=participation.get(m.awayTeamParticipationId);return <article className="historical-match-card" key={m.id} style={{padding:15,border:'1px solid rgba(255,255,255,.07)',borderRadius:12,background:'#0a1713',display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:12,alignItems:'center'}}>
        <div className="historical-match-home"><strong>{label(home)}</strong><div style={{fontSize:9,color:'#71877d',marginTop:5}}>{home?.confederation ?? 'Confederation unavailable'}</div></div>
        <div className="historical-match-score" style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:900}}>{score(m)}</div><div style={{fontSize:9,color:'#9cefc0',marginTop:4}}>{stageLabels[m.stage]??m.stage}</div></div>
        <div className="historical-match-away" style={{textAlign:'right'}}><strong>{label(away)}</strong><div style={{fontSize:9,color:'#71877d',marginTop:5}}>{away?.confederation ?? 'Confederation unavailable'}</div></div>
        <div style={{gridColumn:'1 / -1',borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:9,fontSize:9,color:'#7f968a'}}>{m.date ?? 'Date unavailable'} · {m.venue ?? 'Venue unavailable'}{m.hostCity ? ` · ${m.hostCity}` : ''}</div>
      </article>})}</section>
      {matches.length===0 && <div role="status" style={{padding:30,textAlign:'center',color:'#71877d',border:'1px solid rgba(255,255,255,.06)',borderRadius:12}}>No recorded fixtures match these filters.</div>}
      <p style={{fontSize:9,color:'#526a60',lineHeight:1.6,marginTop:14}}>This view uses the historical archive's provenance-backed match records. It does not infer lineups, tactics, player ratings, or simulated events.</p>
    </main>
  </div>;
}
