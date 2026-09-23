import { useEffect, useMemo, useState } from 'react';
import { FORMATION_SPECS, ROLE_OPTIONS, type Formation, type LineupPlayer, type Player, type Role, type SimulationResult, type WorldCupData } from '../types';
import { simulateMatch } from '../engine/simulation';
import { autoArrange, slotsForFormation } from '../utils';

const FORMATIONS: Formation[] = ['4-3-3','4-2-3-1','4-4-2','3-4-3','3-5-2','4-1-4-1','4-3-1-2','5-3-2'];
const FORMATION_LABELS: Record<Formation,string> = {
  '4-3-3':'4-3-3','4-2-3-1':'4-2-3-1','4-4-2':'4-4-2','3-4-3':'3-4-3','3-5-2':'3-5-2','4-1-4-1':'4-1-4-1','4-3-1-2':'4-3-1-2','5-3-2':'5-3-2'
};

function seed(squad: Player[], formation: Formation, random = false) {
  const slots = slotsForFormation(formation);
  const counts = slots.reduce<Record<string,number>>((a,s) => { a[s.position]=(a[s.position]||0)+1; return a; }, {});
  const selected: Player[] = [];
  for (const position of ['GK','DEF','MID','FWD'] as const) {
    const pool = squad.filter(p => p.position === position);
    if (random) pool.sort(() => Math.random() - .5);
    else pool.sort((a,b) => b.rating-a.rating);
    selected.push(...pool.slice(0, counts[position] || 0));
  }
  return autoArrange(selected.map(p=>p.id), formation, squad);
}

export default function HistoricalXIBuilder({ teamName, onBack }: { teamName: string; onBack: () => void }) {
  const [data, setData] = useState<WorldCupData|null>(null);
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [lineup, setLineup] = useState<LineupPlayer[]>([]);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState<{id:string;dx:number;dy:number}|null>(null);
  const [opponentId, setOpponentId] = useState('');
  const [simulation, setSimulation] = useState<SimulationResult|null>(null);

  useEffect(() => {
    fetch('/data/worldCup2026.json').then(r => r.ok ? r.json() : Promise.reject(new Error()))
      .then((d: WorldCupData) => setData(d))
      .catch(() => setError('The 2026 tournament squad dataset is unavailable in this build.'));
  }, []);

  const team = data?.teams.find(t => t.name === teamName);
  const squad = useMemo(() => data?.players.filter(p => p.teamId === team?.id) ?? [], [data, team?.id]);
  const playerMap = useMemo(() => new Map(squad.map(p => [p.id,p])), [squad]);
  const opponents = useMemo(() => data?.teams.filter(t => t.id !== team?.id) ?? [], [data, team?.id]);
  const opponent = data?.teams.find(t => t.id === opponentId);
  useEffect(() => { if (!opponentId && opponents[0]) setOpponentId(opponents[0].id); }, [opponentId, opponents]);

  useEffect(() => {
    if (!squad.length) return;
    const next = seed(squad, formation);
    setLineup(next);
    setSelectedId(next[0]?.playerId ?? null);
  }, [squad, formation]);

  const selected = selectedId ? playerMap.get(selectedId) : undefined;
  const replace = (playerId: string) => {
    if (!selectedId || lineup.some(p=>p.playerId===playerId)) return;
    setLineup(ls => ls.map(p => p.playerId===selectedId ? {...p,playerId} : p));
    setSelectedId(playerId);
  };
  const reset = () => { const next=seed(squad,formation); setLineup(next); setSelectedId(next[0]?.playerId??null); setSimulation(null); };
  const randomize = () => { const next=seed(squad,formation,true); setLineup(next); setSelectedId(next[0]?.playerId??null); setSimulation(null); };
  const arrange = () => { setLineup(ls=>autoArrange(ls.map(p=>p.playerId),formation,squad)); setSimulation(null); };
  const setRole = (role: Role) => { setLineup(ls=>ls.map(p=>p.playerId===selectedId?{...p,role}:p)); setSimulation(null); };
  const runSimulation = () => { if (!team || !opponent || lineup.length !== 11) return; setSimulation(simulateMatch(team,opponent,{formation,players:lineup,tactics:{possession:58,pressing:58,defensiveLine:56,width:55,tempo:54,attackingRisk:48}},{formation:'4-3-3',preset:'Balanced',tactics:{possession:50,pressing:50,defensiveLine:52,width:52,tempo:52,attackingRisk:48}},data!.players,1,{year:2026,mode:'historical',competition:'FIFA World Cup 2026',dataBasis:'2026 final-squad dataset and app-assigned tactical roles',assumptions:['This is a hypothetical 2026 tournament-context simulation, not a replay of a recorded fixture.','No historical match result is used to determine the simulated score.']})); };
  const down = (e:React.PointerEvent,id:string) => {
    const rect=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setDrag({id,dx:e.clientX-rect.left-rect.width/2,dy:e.clientY-rect.top-rect.height/2});
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e:React.PointerEvent) => {
    if(!drag) return;
    const el=document.getElementById('historical-xi-pitch');
    if(!el) return;
    const r=el.getBoundingClientRect();
    const x=((e.clientX-r.left-drag.dx)/r.width)*100;
    const y=((e.clientY-r.top-drag.dy)/r.height)*100;
    setLineup(ls=>ls.map(p=>p.playerId===drag.id?{...p,x:Math.max(5,Math.min(95,x)),y:Math.max(7,Math.min(93,y))}:p));
  };

  return <div style={{minHeight:'100vh',background:'#07120f',color:'#eef8f3',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
    <header style={{height:72,borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',background:'#081410'}}>
      <div><div style={{fontSize:15,fontWeight:900,letterSpacing:'.16em'}}>TACTICAL XI</div><div style={{fontSize:9,color:'#7f968a',letterSpacing:'.18em',marginTop:4}}>HISTORICAL XI BUILDER · 2026</div></div>
      <button onClick={onBack} style={{border:'1px solid #264136',background:'#0b1713',color:'#9cefc0',borderRadius:8,padding:'8px 12px',cursor:'pointer'}}>← Back to tournament</button>
    </header>
    <main style={{maxWidth:1180,margin:'0 auto',padding:28}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:20,marginBottom:18,flexWrap:'wrap'}}>
        <div><div style={{fontSize:9,letterSpacing:'.18em',color:'#7f968a',fontWeight:800}}>FIFA WORLD CUP 2026 · COMPLETED EDITION</div><h1 style={{fontSize:30,margin:'6px 0'}}>Build {teamName}'s XI</h1><p style={{fontSize:11,color:'#8ea69b',margin:0,lineHeight:1.6}}>Uses the tournament's 2026 final-squad dataset. Tactical roles are app-assigned model roles, not official historical lineup claims.</p></div>
        <select value={formation} onChange={e=>setFormation(e.target.value as Formation)} style={{background:'#0b1713',border:'1px solid #264136',color:'#eef8f3',padding:'10px 12px',borderRadius:9}}>{FORMATIONS.map(f=><option key={f}>{FORMATION_LABELS[f]}</option>)}</select>
      </div>
      {error ? <div style={{padding:20,borderRadius:12,background:'#21180d',color:'#e6c783'}}>{error}</div> : !data || !team ? <div style={{padding:20,color:'#8ea69b'}}>Loading the 2026 tournament squad…</div> : <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:14}}>
        <section style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,padding:18,background:'#0a1713'}}>
          <div id="historical-xi-pitch" onPointerMove={move} onPointerUp={()=>setDrag(null)} onPointerLeave={()=>drag&&setDrag(null)} style={{position:'relative',height:560,borderRadius:14,overflow:'hidden',background:'linear-gradient(90deg,#0d3b24 0 49.5%,#0e4328 49.5% 50.5%,#0d3b24 50.5% 100%)',border:'1px solid #2c6545'}}>
            <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'rgba(255,255,255,.22)'}}/><div style={{position:'absolute',left:'50%',top:'50%',width:120,height:120,transform:'translate(-50%,-50%)',border:'1px solid rgba(255,255,255,.25)',borderRadius:'50%'}}/>
            <div style={{position:'absolute',left:'50%',top:'50%',width:5,height:5,transform:'translate(-50%,-50%)',background:'#fff',borderRadius:'50%'}}/>
            {lineup.map(lp=>{const p=playerMap.get(lp.playerId);if(!p)return null;return <button key={p.id} onPointerDown={e=>down(e,p.id)} onClick={()=>setSelectedId(p.id)} title="Drag to reposition" style={{position:'absolute',left:lp.x+'%',top:lp.y+'%',transform:'translate(-50%,-50%)',background:'transparent',border:0,color:'#fff',cursor:'grab',textAlign:'center'}}><span style={{display:'grid',placeItems:'center',width:42,height:42,borderRadius:'50%',background:selectedId===p.id?'#b9ffd2':'#10271b',color:selectedId===p.id?'#07120f':'#eef8f3',border:'2px solid #8beeb2',fontWeight:900,fontSize:11}}>{p.name.split(' ').slice(-1)[0].slice(0,3).toUpperCase()}</span><span style={{display:'block',fontSize:9,marginTop:3,textShadow:'0 1px 3px #000'}}>{p.name.split(' ').slice(-1)[0]}</span><span style={{display:'block',fontSize:8,color:'#b9ffd2'}}>{lp.role}</span></button>})}
            <div style={{position:'absolute',left:10,bottom:9,fontSize:8,color:'rgba(255,255,255,.55)'}}>Drag players to rewrite the shape</div>
          </div>
        </section>
        <aside style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,padding:16,background:'#0a1713'}}>
          <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800}}>QUICK ACTIONS</div>
          <div style={{display:'grid',gap:7,margin:'10px 0 18px'}}>{[['Reset XI',reset],['Random XI',randomize],['Auto Arrange',arrange]].map(([label,fn])=><button key={label as string} onClick={fn as ()=>void} style={{background:'#0b1713',border:'1px solid #264136',color:'#b9ffd2',padding:'9px',borderRadius:8,cursor:'pointer'}}>{label as string}</button>)}</div>
          <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800}}>SELECTED PLAYER</div>
          {selected ? <div style={{marginTop:9,padding:12,borderRadius:10,background:'#081410'}}><strong>{selected.name}</strong><div style={{fontSize:10,color:'#7f968a',marginTop:4}}>{selected.position} · Tactical Rating {selected.rating}</div><label style={{display:'block',fontSize:9,color:'#7f968a',marginTop:12}}>APP-ASSIGNED ROLE</label><select value={lineup.find(p=>p.playerId===selected.id)?.role} onChange={e=>setRole(e.target.value as Role)} style={{width:'100%',marginTop:5,background:'#07120f',border:'1px solid #264136',color:'#eef8f3',padding:8,borderRadius:7}}>{ROLE_OPTIONS[selected.position].map(r=><option key={r}>{r}</option>)}</select></div> : <p style={{fontSize:11,color:'#71877d'}}>Select a player on the pitch.</p>}
          <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800,marginTop:18}}>HISTORICAL SIMULATION</div>
          <div style={{fontSize:10,color:'#71877d',marginTop:6,lineHeight:1.5}}>2026 is currently the only edition with tournament-specific squad records. Older editions stay unavailable rather than receiving modern player data.</div>
          <select value={opponentId} onChange={e=>{setOpponentId(e.target.value);setSimulation(null)}} style={{width:'100%',marginTop:8,background:'#07120f',border:'1px solid #264136',color:'#eef8f3',padding:8,borderRadius:7}}>{opponents.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <button disabled={!opponent} onClick={runSimulation} style={{width:'100%',marginTop:7,background:'#12301f',border:'1px solid #2d6b49',color:'#b9ffd2',padding:'9px',borderRadius:8,cursor:'pointer'}}>Simulate hypothetical 2026 match</button>
          {simulation && <div style={{marginTop:9,padding:10,borderRadius:9,background:'#081410'}}><strong>{team?.name} {simulation.score[0]} — {simulation.score[1]} {opponent?.name}</strong><div style={{fontSize:9,color:'#7f968a',marginTop:5}}>HYPOTHETICAL · NOT A HISTORICAL RESULT</div><div style={{fontSize:10,color:'#b9ffd2',marginTop:7}}>{simulation.verdict[0]}</div><details style={{marginTop:7,fontSize:9,color:'#8ea69b'}}><summary>Simulation assumptions</summary>{simulation.assumptions.map((a,i)=><div key={i} style={{marginTop:4}}>• {a}</div>)}</details></div>}
          <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800,marginTop:18}}>REPLACE PLAYER</div>
          <div style={{maxHeight:290,overflow:'auto',marginTop:8}}>{squad.map(p=><button key={p.id} disabled={lineup.some(x=>x.playerId===p.id)} onClick={()=>replace(p.id)} style={{display:'flex',justifyContent:'space-between',width:'100%',padding:'8px 0',background:'transparent',border:0,borderBottom:'1px solid rgba(255,255,255,.05)',color:lineup.some(x=>x.playerId===p.id)?'#3f5148':'#dcebe3',textAlign:'left',cursor:lineup.some(x=>x.playerId===p.id)?'default':'pointer'}}><span>{p.name}</span><small>{p.rating}</small></button>)}</div>
        </aside>
      </div>}
      <div style={{marginTop:12,fontSize:9,color:'#526a60'}}>Historical builder boundary: older editions remain unavailable until tournament-specific squad/player records are imported. No 2026 players are substituted into older tournaments.</div>
    </main>
  </div>;
}
