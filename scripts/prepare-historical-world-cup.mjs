import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'data', 'historicalWorldCup');
const MANIFEST_OUT = path.join(OUT_DIR, 'index.json');
const SOURCE_BASE = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master';
const YEARS = [1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026];
const NOT_HELD = [1942, 1946];
const DATA_DATE_OVERRIDE = process.env.HISTORICAL_DATA_DATE?.trim();
const FORCE_REFRESH = process.env.FORCE_DATA_REFRESH === '1';

const SOURCE_POLICY = {
  matchArchive: 'OpenFootball World Cup JSON',
  sourceUrl: 'https://github.com/openfootball/worldcup.json',
  license: 'CC0-1.0',
  notes: 'Historical team names are preserved. 1942 and 1946 are modeled as not-held editions and intentionally have no match import.',
};

const stageRank = {
  group: 1,
  'first-round': 2,
  'round-of-32': 3,
  'round-of-16': 4,
  'quarter-final': 5,
  'semi-final': 6,
  'third-place': 7,
  final: 8,
  'final-group': 1,
};

function stageFor(round = '', group = '') {
  const value = `${round} ${group}`.toLowerCase();
  if (value.includes('final') && value.includes('third')) return 'third-place';
  if (value.includes('semi')) return 'semi-final';
  if (value.includes('quarter')) return 'quarter-final';
  if (value.includes('round of 16') || value.includes('last 16')) return 'round-of-16';
  if (value.includes('round of 32') || value.includes('last 32')) return 'round-of-32';
  if (value.includes('final') && !value.includes('group')) return 'final';
  if (value.includes('group') || value.includes('matchday')) return 'group';
  return 'first-round';
}

function slug(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function scoreValues(score) {
  if (Array.isArray(score)) return { ft: score };
  if (score && Array.isArray(score.ft)) return { ft: score.ft, aet: score.aet, pens: score.pens };
  throw new Error('Match is missing a final score.');
}

async function fetchEdition(year) {
  const url = `${SOURCE_BASE}/${year}/worldcup.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to fetch ${year} archive: ${response.status} ${response.statusText}`);
  const payload = await response.json();
  if (!Array.isArray(payload.matches) || payload.matches.length === 0) throw new Error(`Archive source for ${year} contains no matches.`);
  return { year, url, payload };
}

async function snapshotExists() {
  try {
    const manifest = JSON.parse(await fs.readFile(MANIFEST_OUT, 'utf8'));
    if (manifest.schemaVersion !== 1 || manifest.editions?.length !== YEARS.length) return null;
    await Promise.all(YEARS.map(year => fs.access(path.join(OUT_DIR, `${year}.json`))));
    if (DATA_DATE_OVERRIDE && manifest.generatedAt !== DATA_DATE_OVERRIDE) return null;
    return manifest.generatedAt;
  } catch {
    return null;
  }
}

function validateDataDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('HISTORICAL_DATA_DATE must use YYYY-MM-DD.');
}

async function main() {
  if (DATA_DATE_OVERRIDE) validateDataDate(DATA_DATE_OVERRIDE);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const existingDate = FORCE_REFRESH ? null : await snapshotExists();
  if (existingDate) {
    console.log(`Using existing local historical World Cup snapshot dated ${existingDate}.`);
    return;
  }

  const retrievedAt = DATA_DATE_OVERRIDE || new Date().toISOString().slice(0, 10);
  const editions = await Promise.all(YEARS.map(fetchEdition));
  const tournaments = editions.map(({ year, url }) => ({ year, id: `wc-${year}`, status: 'completed', sourceUrl: url, retrievedAt }));
  const matches = [];
  const teamParticipations = [];

  for (const { year, url, payload } of editions) {
    const normalized = payload.matches.map((match, index) => {
      const score = scoreValues(match.score);
      const stage = stageFor(match.round, match.group);
      const id = `wc-${year}-match-${String(index + 1).padStart(3, '0')}`;
      return {
        id,
        tournamentId: `wc-${year}`,
        stage,
        date: match.date,
        venue: match.ground,
        homeTeamParticipationId: `wc-${year}-team-${slug(match.team1)}`,
        awayTeamParticipationId: `wc-${year}-team-${slug(match.team2)}`,
        homeScore: score.ft[0],
        awayScore: score.ft[1],
        homeScoreAfterExtraTime: score.aet?.[0],
        awayScoreAfterExtraTime: score.aet?.[1],
        homeScoreAfterPenalties: score.pens?.[0],
        awayScoreAfterPenalties: score.pens?.[1],
        provenance: [{ sourceName: SOURCE_POLICY.matchArchive, sourceUrl: url, retrievedAt, origin: 'official', confidence: 'high', notes: 'Public-domain match archive; historical team naming is preserved from the source.' }],
      };
    });
    const teams = summarizeTeams(year, normalized.map((match, index) => ({
      ...payload.matches[index],
      score: {
        ft: [match.homeScore, match.awayScore],
        aet: match.homeScoreAfterExtraTime == null ? undefined : [match.homeScoreAfterExtraTime, match.awayScoreAfterExtraTime],
        pens: match.homeScoreAfterPenalties == null ? undefined : [match.homeScoreAfterPenalties, match.awayScoreAfterPenalties],
      },
    })));
    for (const team of teams) team.provenance = [{ sourceName: SOURCE_POLICY.matchArchive, sourceUrl: url, retrievedAt, origin: 'official', confidence: 'high' }];
    matches.push(...normalized);
    teamParticipations.push(...teams);
  }

  if (matches.length < 1000) throw new Error(`Historical archive coverage looks incomplete: only ${matches.length} matches were imported.`);
  if (new Set(matches.map(match => match.tournamentId)).size !== YEARS.length) throw new Error('At least one played World Cup edition is missing from the archive.');

  for (const year of YEARS) {
    const editionPayload = {
      schemaVersion: 1,
      generatedAt: retrievedAt,
      sourcePolicy: SOURCE_POLICY,
      notHeld: [],
      tournaments: tournaments.filter(tournament => tournament.year === year),
      teamParticipations: teamParticipations.filter(team => team.tournamentId === `wc-${year}`),
      matches: matches.filter(match => match.tournamentId === `wc-${year}`),
    };
    await fs.writeFile(path.join(OUT_DIR, `${year}.json`), `${JSON.stringify(editionPayload)}\n`);
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: retrievedAt,
    sourcePolicy: SOURCE_POLICY,
    notHeld: NOT_HELD.map(year => ({ year, id: `wc-${year}`, status: 'not-held' })),
    editions: tournaments.map(tournament => ({ ...tournament, file: `${tournament.year}.json` })),
  };

  await fs.writeFile(MANIFEST_OUT, `${JSON.stringify(manifest)}\n`);
  console.log(`Saved ${matches.length} historical matches across ${YEARS.length} played World Cups to ${path.relative(ROOT, OUT_DIR)} (one static file per edition).`);
}

function summarizeTeams(year, matches) {
  const teams = new Map();
  const ensure = name => {
    const id = `wc-${year}-team-${slug(name)}`;
    if (!teams.has(id)) teams.set(id, { id, tournamentId: `wc-${year}`, teamId: id, teamName: name, matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, provenance: [] });
    return teams.get(id);
  };
  for (const match of matches) {
    const home = ensure(match.team1);
    const away = ensure(match.team2);
    const [homeGoals, awayGoals] = match.score.ft;
    home.matchesPlayed += 1; away.matchesPlayed += 1;
    home.goalsFor += homeGoals; home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals; away.goalsAgainst += homeGoals;
    if (homeGoals > awayGoals) { home.wins += 1; away.losses += 1; }
    else if (awayGoals > homeGoals) { away.wins += 1; home.losses += 1; }
    else { home.draws += 1; away.draws += 1; }
  }
  return [...teams.values()];
}

main().catch(error => { console.error(error); process.exit(1); });
