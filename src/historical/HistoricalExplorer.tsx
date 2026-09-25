import { useEffect, useMemo, useRef, useState } from 'react';
import { HISTORICAL_TOURNAMENTS } from './catalog';
import type { HistoricalArchiveDocument } from './archive';
import { loadHistoricalEdition } from './archive';
import HistoricalXIBuilder from './HistoricalXIBuilder';
import HistoricalMatchExplorer from './HistoricalMatchExplorer';
import HistoricalTacticalEvolution from './HistoricalTacticalEvolution';
import HistoricalProvenance from './HistoricalProvenance';
import { navigateHistorical, parseHistoricalHash, type HistoricalRoute } from './navigation';

const years = HISTORICAL_TOURNAMENTS.map(t => t.year);

export default function HistoricalExplorer() {
  const route = parseHistoricalHash();
  const [query, setQuery] = useState('');
  const [archive, setArchive] = useState<HistoricalArchiveDocument | null>(null);
  const [error, setError] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const tournament = HISTORICAL_TOURNAMENTS.find(t => t.year === route.year) ?? HISTORICAL_TOURNAMENTS[0];

  useEffect(() => {
    setArchive(null);
    setError('');
    if (tournament.status === 'not-held') return undefined;

    let active = true;
    loadHistoricalEdition(route.year)
      .then(next => {
        if (active) setArchive(next);
      })
      .catch(() => {
        if (active) setError('The selected historical tournament archive is not available in this build. Run npm run prepare:historical and rebuild.');
      });

    return () => {
      active = false;
    };
  }, [route.year, tournament.status]);

  useEffect(() => {
    requestAnimationFrame(() => mainRef.current?.focus());
  }, [route.view, route.year, route.team, route.player]);

  const allTeams = useMemo(() => {
    if (!archive || tournament.status === 'not-held') return [];
    return archive.teamParticipations
      .filter(t => t.tournamentId === tournament.id)
      .sort((a, b) => (a.finishPosition ?? 999) - (b.finishPosition ?? 999) || a.teamName.localeCompare(b.teamName));
  }, [archive, tournament]);
  const teams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTeams.filter(t => !q || t.teamName.toLowerCase().includes(q));
  }, [allTeams, query]);
  const selectedTeam = allTeams.find(team => team.teamName === route.team);
  const matches = archive?.matches.filter(m => m.tournamentId === tournament.id).length ?? 0;

  const navigate = (next: Partial<HistoricalRoute>) => {
    navigateHistorical({
      view: next.view ?? 'tournament',
      year: next.year ?? route.year,
      team: next.team ?? undefined,
      player: next.player ?? undefined,
      opponent: next.opponent ?? undefined,
      formation: next.formation,
    });
  };

  if (route.view === 'builder' && route.year === 2026 && route.team) {
    return (
      <HistoricalXIBuilder
        teamName={route.team}
        initialOpponentName={route.opponent}
        initialFormation={route.formation}
        onBack={() => navigate({ view: 'tournament', team: route.team })}
      />
    );
  }

  if (route.view === 'evolution') {
    return <HistoricalTacticalEvolution initialYear={route.year} onBack={() => navigate({ view: 'tournament', year: route.year })} />;
  }

  if (route.view === 'matches' && archive && tournament.status !== 'not-held') {
    return <HistoricalMatchExplorer archive={archive} tournamentId={tournament.id} onBackToTournament={() => navigate({ view: 'tournament', year: route.year, team: route.team })} />;
  }

  return (
    <div className="historical-page" style={{minHeight:'100vh',background:'#07120f',color:'#eef8f3',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
      <header className="historical-header" style={{height:72,borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',background:'#081410'}}>
        <div>
          <div style={{fontSize:15,fontWeight:900,letterSpacing:'.16em'}}>TACTICAL XI</div>
          <div style={{fontSize:9,color:'#7f968a',letterSpacing:'.18em',marginTop:4}}>HISTORICAL WORLD CUP EXPLORER</div>
        </div>
        <div className="historical-header-actions" style={{display:'flex',alignItems:'center',gap:10}}>
          <span className="historical-context">{'WORLD CUP ' + route.year + (route.team ? ' · ' + route.team : '')}</span>
          <a href="#" style={{color:'#9cefc0',fontSize:11,textDecoration:'none'}}>Back to Tactical XI</a>
        </div>
      </header>

      <main ref={mainRef} className="historical-main" style={{maxWidth:1180,margin:'0 auto',padding:28}} tabIndex={-1} aria-labelledby="historical-page-title">
        <div className="historical-page-heading" style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'end',marginBottom:22}}>
          <div>
            <div style={{fontSize:9,letterSpacing:'.18em',color:'#7f968a',fontWeight:800}}>TOURNAMENT ARCHIVE</div>
            <h1 id="historical-page-title" style={{fontSize:30,margin:'6px 0 0',letterSpacing:'-.04em'}}>World Cup {route.year}</h1>
            <p style={{color:'#8ea69b',fontSize:12,maxWidth:650,lineHeight:1.6,margin:'8px 0 0'}}>Browse tournament-specific teams and archived match context without touching the modern 2026 player registry.</p>
          </div>
          <nav className="historical-year-nav" aria-label="World Cup year">
            {years.map(y => (
              <button key={y} aria-current={y === route.year ? 'page' : undefined} aria-label={'Open World Cup ' + y} onClick={() => { setQuery(''); navigate({ view:'tournament', year:y }); }} style={{border:'1px solid '+(y===route.year?'#63dc98':'#1b3027'),background:y===route.year?'#12301f':'#0b1713',color:y===route.year?'#b9ffd2':'#9bb0a6',borderRadius:8,padding:'7px 9px',fontSize:10,cursor:'pointer'}}>{y}</button>
            ))}
          </nav>
        </div>

        <div className="historical-context-bar" style={{display:'flex',gap:8,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',marginBottom:12}}>
          <div style={{fontSize:10,color:'#71877d'}}>Context: World Cup {route.year}{route.team ? ' · ' + route.team : ''}{route.player ? ' · player ' + route.player : ''}</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {route.team && <button aria-label={'Clear selected team ' + route.team} onClick={() => navigate({ view:'tournament', year:route.year })} style={{background:'#0b1713',border:'1px solid #264136',color:'#9cefc0',borderRadius:8,padding:'7px 10px',cursor:'pointer'}}>Clear team</button>}
            <button onClick={() => navigate({ view:'evolution', year:route.year })} style={{background:'#12301f',border:'1px solid #2d6b49',color:'#b9ffd2',borderRadius:8,padding:'9px 12px',cursor:'pointer'}}>Tactical evolution</button>
            <button disabled={tournament.status==='not-held'} onClick={() => navigate({ view:'matches', year:route.year, team:route.team })} style={{background:'#12301f',border:'1px solid #2d6b49',color:'#b9ffd2',borderRadius:8,padding:'9px 12px',cursor:tournament.status==='not-held'?'not-allowed':'pointer'}}>Explore recorded matches ({matches})</button>
          </div>
        </div>

        <section style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,background:'#0a1713',padding:18}}>
          <div className="historical-toolbar" style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:16,flexWrap:'wrap'}}>
            <div><strong style={{fontSize:16}}>{tournament.name}</strong><div style={{fontSize:10,color:'#71877d',marginTop:4}}>{tournament.hosts.map(h=>h.name).join(', ') || 'No host: not held'} · {tournament.format}</div></div>
            <label style={{fontSize:10,color:'#71877d'}}>Search teams<input aria-label="Search participating teams" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search teams" disabled={tournament.status==='not-held'} style={{display:'block',marginTop:5,background:'#07120f',border:'1px solid #22392e',color:'#eef8f3',borderRadius:9,padding:'10px 12px',outline:'none',width:220}} /></label>
          </div>

          {route.player && <div role="status" style={{marginBottom:12,padding:10,borderRadius:9,background:'rgba(245,184,88,.05)',border:'1px solid rgba(245,184,88,.12)',color:'#cbb57b',fontSize:10}}>Historical player context <strong>{route.player}</strong> is not present in the current local archive. No player record is inferred from the 2026 registry.</div>}

          {tournament.status==='not-held' ? (
            <div role="status" style={{padding:'34px 10px',textAlign:'center',color:'#d6b978',background:'rgba(245,184,88,.05)',border:'1px solid rgba(245,184,88,.12)',borderRadius:12}}>This edition was not held. No teams, players, or matches are imported.</div>
          ) : error ? (
            <div role="alert" style={{padding:18,color:'#e6c783',background:'rgba(245,184,88,.05)',borderRadius:12}}>{error}</div>
          ) : !archive ? (
            <div role="status" aria-live="polite" style={{padding:18,color:'#8ea69b'}}>Loading historical archive for {route.year}…</div>
          ) : (
            <>
              <div className="historical-stats" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
                {[
                  ['Teams',String(teams.length)],
                  ['Matches',String(matches)],
                  ['Champion',tournament.finalStandings?.[0] ?? 'Unknown']
                ].map(([label,value])=><div key={label} style={{padding:13,border:'1px solid rgba(255,255,255,.06)',borderRadius:10}}><div style={{fontSize:9,color:'#678076'}}>{label}</div><div style={{fontSize:16,fontWeight:850,marginTop:4}}>{value}</div></div>)}
              </div>

              <div className="historical-team-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:9}}>
                {teams.map(team => {
                  const selected = route.team === team.teamName;
                  return (
                    <article key={team.id} aria-current={selected ? 'location' : undefined} style={{padding:13,border:'1px solid '+(selected?'#3e8762':'rgba(255,255,255,.06)'),borderRadius:11,background:selected?'#0d2118':'#081410'}}>
                      <strong>{team.teamName}</strong>
                      <div style={{fontSize:10,color:'#71877d',marginTop:7}}>{team.matchesPlayed ?? 0} matches · {team.wins ?? 0}W {team.draws ?? 0}D {team.losses ?? 0}L</div>
                      <div style={{fontSize:10,color:'#8fa79b',marginTop:4}}>{team.goalsFor ?? 0} GF · {team.goalsAgainst ?? 0} GA</div>
                      {team.stageReached && <div style={{fontSize:9,color:'#9cefc0',marginTop:8}}>Stage: {team.stageReached}</div>}
                      <button aria-label={'Open ' + team.teamName + ' World Cup ' + route.year + ' context'} onClick={() => navigate({ view:'tournament', year:route.year, team:team.teamName })} style={{marginTop:10,width:'100%',background:'#12301f',border:'1px solid #2d6b49',color:'#b9ffd2',borderRadius:7,padding:'8px',fontSize:10,cursor:'pointer'}}>{selected ? 'Selected team' : 'Open team context'}</button>
                      {year2026CanBuild(route.year) && <button aria-label={'Build ' + team.teamName + ' historical XI'} onClick={() => navigate({ view:'builder', year:2026, team:team.teamName, formation:'4-3-3' })} style={{marginTop:7,width:'100%',background:'#0b1713',border:'1px solid #264136',color:'#9cefc0',borderRadius:7,padding:'8px',fontSize:10,cursor:'pointer'}}>Build Historical XI</button>}
                    </article>
                  );
                })}
              </div>

              {route.team && selectedTeam && route.year === 2026 && <div className="historical-team-context" style={{marginTop:14,padding:14,border:'1px solid rgba(121,220,163,.14)',borderRadius:12,background:'#081410'}}>
                <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800}}>SELECTED TEAM CONTEXT</div>
                <div style={{fontSize:18,fontWeight:850,marginTop:5}}>{selectedTeam.teamName}</div>
                <div style={{fontSize:10,color:'#71877d',marginTop:5}}>2026 final-squad builder available · tournament participation {selectedTeam.stageReached ?? 'recorded'}</div>
                <button onClick={() => navigate({view:'builder',year:2026,team:selectedTeam.teamName,formation:'4-3-3'})} style={{marginTop:10,background:'#12301f',border:'1px solid #2d6b49',color:'#b9ffd2',borderRadius:8,padding:'8px 11px',cursor:'pointer'}}>Open XI builder</button>
              </div>}

              {teams.length===0 && <div role="status" style={{padding:24,textAlign:'center',color:'#71877d'}}>No participating team matches that search.</div>}
            </>
          )}
        </section>

        <HistoricalProvenance archive={archive} tournaments={HISTORICAL_TOURNAMENTS} />
        <p style={{fontSize:9,color:'#526a60',lineHeight:1.6,marginTop:14}}>Historical facts and archived match records are sourced data. Player-level historical records are not inferred from the current 2026 roster.</p>
      </main>
    </div>
  );
}

function year2026CanBuild(year: number): boolean {
  return year === 2026;
}
