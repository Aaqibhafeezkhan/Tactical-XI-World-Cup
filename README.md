# Tactical XI - FIFA World Cup

**Build the XI. Change the tactics. Rewrite the match.**

Tactical XI is a focused tactical sandbox for the FIFA World Cup 2026. Pick a national team, choose an opponent, build an XI on a football pitch, tune the tactical controls and simulate a hypothetical match.

## Features

- 48 World Cup 2026 teams
- 1,248-player final-squad registry snapshot
- Historical World Cup archive from 1930 through 2026
- Explicit 1942 and 1946 not-held editions
- Historical tournament metadata, final standings and match results
- Historical team names preserved by tournament
- Eight focused formations
- Drag-and-drop lineup positioning
- Player roles and squad replacement
- Possession, pressing, defensive line, width, tempo and attacking-risk controls
- Simplified opponent tactical presets
- Transparent rules-based simulation engine
- Score, possession, shots, xG, turnovers, corners and big chances
- Hypothetical event timeline
- Tactical verdict generated from the actual tactics and result
- App-generated Tactical Ratings (not official FIFA ratings)
- Reset XI, Random XI and Auto Arrange
- Responsive dark stadium-inspired UI
- Vitest unit tests for lineup, simulation and historical archive contracts
- GitHub Pages deployment via GitHub Actions

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Data preparation

The normal `npm run dev` / `npm run build` flow prepares both the current 2026 registry and the historical World Cup archive.

Historical archive preparation can also be run independently:

```bash
npm run prepare:historical
```

The historical preparation script materializes `public/data/historicalWorldCup.json` from the public-domain OpenFootball World Cup JSON archive. It imports the played editions from 1930 through 2026, preserves historical team names, normalizes match stages and scores, records provenance, and explicitly excludes 1942 and 1946 because those tournaments were not held.

The historical archive is a build-time/static dataset. The application does not make football-data API calls at runtime.

The 2026 registry preparation materializes `public/data/worldCup2026.json`. After that, the app reads the local static snapshot.

To refresh the 2026 snapshot:

```bash
FORCE_DATA_REFRESH=1 npm run prepare:data
```

PowerShell:

```powershell
$env:FORCE_DATA_REFRESH="1"; npm run prepare:data
```

The 2026 sync script expects exactly **48 teams and 1,248 players** and fails rather than silently generating incomplete data.

## Historical archive coverage

The archive covers every played men's FIFA World Cup edition:

`1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026`

The modeled catalog also contains `1942` and `1946` with status `not-held`. They intentionally have no match records.

Historical match records include tournament, stage, date where available, venue where available, tournament-specific team participation IDs, final score, and source provenance. Player/squad records remain a separate layer so incomplete historical squad evidence is not silently filled from modern rosters.

## Historical data provenance

Tournament metadata is maintained against FIFA World Cup historical scope. Match archive data is prepared from the public-domain OpenFootball World Cup JSON datasets. Historical names are preserved rather than silently mapping countries to modern identities.

The project distinguishes:

1. **Recorded historical facts** — sourced tournament and match data.
2. **Reconstructed tactical metadata** — tactical information that may require historical reconstruction.
3. **Model-generated analysis** — hypothetical simulation outputs and app-generated ratings.

The archive should not be interpreted as an official FIFA ratings or prediction product.

## GitHub Pages

The repository is configured to deploy automatically from `main` using GitHub Actions.

The workflow:

1. installs the Node dependencies
2. materializes the complete 48-team / 1,248-player 2026 dataset
3. prepares the historical World Cup archive
4. runs the test suite
5. builds the Vite site with the repository Pages base path
6. uploads `dist/` as the Pages artifact
7. deploys the artifact to the `github-pages` environment

In GitHub, enable **Settings → Pages → Source → GitHub Actions** once.

## Architecture

```text
World Cup static data
        ↓
Historical archive + 2026 registry
        ↓
Tactical State (React hooks)
        ↓
Formation + positioning rules
        ↓
Simulation Engine
  ├─ possession
  ├─ chance quality
  ├─ tactical risk
  ├─ event generation
  └─ player ratings
        ↓
Match Result
        ↓
Tactical Report + Player Ratings
```

The app intentionally has **no backend, database, authentication, live match feeds, news, fantasy, betting or generic league selector**.

## Test

```bash
npm test
```

## Build

```bash
npm run build
npm run preview
```

## Disclaimer

Every match generated by Tactical XI is a **hypothetical simulation**. Scores, xG, events and player ratings generated by the app's tactical model are not official FIFA predictions, ratings or match records. Historical match records in the archive are sourced records and are kept separate from simulated outcomes.
