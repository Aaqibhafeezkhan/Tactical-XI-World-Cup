import type { HistoricalArchiveDocument } from './archive';
import type { HistoricalTournament } from './types';

export default function HistoricalProvenance({ archive, tournaments }: { archive: HistoricalArchiveDocument | null; tournaments: HistoricalTournament[] }) {
  const sources = [...new Map(tournaments.flatMap(tournament => tournament.provenance).map(record => [record.sourceUrl, record])).values()];
  return <section style={{border:'1px solid rgba(255,255,255,.08)',borderRadius:16,background:'#0a1713',padding:18,marginTop:14}}>
    <div style={{fontSize:9,letterSpacing:'.16em',color:'#7f968a',fontWeight:800}}>METHODOLOGY & PROVENANCE</div>
    <h2 style={{fontSize:18,margin:'7px 0'}}>What is sourced, reconstructed, and derived?</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9,marginTop:12}}>
      <article style={{padding:12,border:'1px solid rgba(255,255,255,.06)',borderRadius:10}}><strong>Official facts</strong><p style={{fontSize:10,color:'#8ea69b',lineHeight:1.55}}>Tournament scope and metadata are attributed to the FIFA World Cup source recorded in each tournament provenance entry.</p></article>
      <article style={{padding:12,border:'1px solid rgba(255,255,255,.06)',borderRadius:10}}><strong>Reconstructed</strong><p style={{fontSize:10,color:'#8ea69b',lineHeight:1.55}}>Tactical formations or roles marked reconstructed are analytical historical metadata, not claims that the source recorded an exact XI shape.</p></article>
      <article style={{padding:12,border:'1px solid rgba(255,255,255,.06)',borderRadius:10}}><strong>Derived</strong><p style={{fontSize:10,color:'#8ea69b',lineHeight:1.55}}>Formation frequencies, era groupings, coordinate signals, and simulation outputs are calculated by the application.</p></article>
    </div>
    <div style={{marginTop:14,padding:12,borderRadius:10,background:'#081410',fontSize:10,color:'#9bb0a6',lineHeight:1.6}}>
      <strong>Archive source policy</strong><br/>
      {archive ? <>{archive.sourcePolicy.matchArchive} · {archive.sourcePolicy.license}<br/><span style={{color:'#71877d'}}>Generated: {archive.generatedAt} · Source retrieval metadata is retained in the archive records.</span></> : 'The historical archive is not loaded, so archive-level source metadata is unavailable in this build.'}
    </div>
    <div style={{marginTop:12}}>
      <strong style={{fontSize:10}}>Recorded source entries</strong>
      {sources.map(source => <div key={source.sourceUrl} style={{marginTop:7,fontSize:9,color:'#8ea69b'}}><span>{source.sourceName}</span> · <a href={source.sourceUrl} target="_blank" rel="noreferrer" style={{color:'#9cefc0'}}>{source.sourceUrl}</a> · retrieved {source.retrievedAt}{source.asOf ? ` · as of ${source.asOf}` : ''}</div>)}
    </div>
    <p style={{fontSize:9,color:'#526a60',lineHeight:1.6,margin:'12px 0 0'}}>Known data gaps remain explicit. Historical player/squad records are not filled from the current 2026 registry, and unavailable tactical evidence is not converted into false precision.</p>
  </section>;
}
