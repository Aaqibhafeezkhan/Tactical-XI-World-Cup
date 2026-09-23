import { describe, expect, it } from 'vitest';
import { matchesForTournament, type HistoricalArchiveDocument } from './archive';

const archive: HistoricalArchiveDocument = {
  schemaVersion:1, generatedAt:'2026-09-10',
  sourcePolicy:{matchArchive:'test',sourceUrl:'test',license:'CC0-1.0',notes:'test'},
  notHeld:[{year:1942,id:'wc-1942',status:'not-held'}],
  tournaments:[{year:1954,id:'wc-1954',status:'completed',sourceUrl:'test',retrievedAt:'2026-09-10'}],
  teamParticipations:[
    {id:'a',tournamentId:'wc-1954',teamId:'a',teamName:'West Germany',matchesPlayed:1,provenance:[]},
    {id:'b',tournamentId:'wc-1954',teamId:'b',teamName:'Hungary',matchesPlayed:1,provenance:[]},
  ],
  matches:[{id:'m1',tournamentId:'wc-1954',stage:'final',homeTeamParticipationId:'a',awayTeamParticipationId:'b',homeScore:3,awayScore:2,venue:'Bern',provenance:[]},
           {id:'m2',tournamentId:'wc-1950',stage:'final',homeTeamParticipationId:'a',awayTeamParticipationId:'b',homeScore:1,awayScore:2,provenance:[]}],
};

describe('historical match context',()=>{
  it('returns only fixtures for the selected tournament',()=>expect(matchesForTournament(archive,'wc-1954').map(m=>m.id)).toEqual(['m1']));
  it('preserves stage and score fields',()=>{const m=matchesForTournament(archive,'wc-1954')[0];expect(m.stage).toBe('final');expect(m.homeScore).toBe(3);expect(m.awayScore).toBe(2);});
});
