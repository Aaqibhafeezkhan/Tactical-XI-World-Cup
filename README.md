# Tactical XI - FIFA World Cup

**Build the XI. Change the tactics. Rewrite the match.**

Tactical XI is a tactical sandbox and historical World Cup explorer. The application combines the existing 2026 tactical XI experience with a static historical archive covering every played men's FIFA World Cup from 1930 through 2026.

## What you can explore

- 48 World Cup 2026 teams and 1,248-player final-squad registry snapshot
- Historical World Cup editions from 1930 through 2026
- Explicit 1942 and 1946 editions marked as not held
- Tournament metadata, final standings, champions and archived match results
- Historical team participation and match exploration
- Historical tactical evolution and comparison views
- Historical XI construction where tournament-specific squad data is available
- Eight focused formations and drag-and-drop lineup positioning
- Player roles and squad replacement
- Possession, pressing, defensive line, width, tempo and attacking-risk controls
- Simplified opponent tactical presets
- Transparent rules-based hypothetical simulation
- Score, possession, shots, xG, turnovers, corners and big chances
- Hypothetical event timeline and tactical report
- App-generated Tactical Ratings, which are not official FIFA ratings
- Reset XI, Random XI and Auto Arrange
- Responsive stadium-inspired UI

## Historical World Cup scope

The historical catalog represents the men's FIFA World Cup final tournaments:

`1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026`

The catalog also represents:

- **1942 — not held**
- **1946 — not held**

These editions intentionally have no match records.

### Historical data boundaries

The project keeps three layers separate:

1. **Recorded historical facts** — sourced tournament, team and match records.
2. **Reconstructed tactical metadata** — tactical information that may require historical reconstruction and should not be presented as exact when evidence is incomplete.
3. **Model-generated analysis** — hypothetical simulations and app-generated ratings.

Historical player/squad data is tournament-specific. When historical evidence is unavailable, the application should show that limitation rather than silently substitute players from the modern 2026 registry.

## Data provenance

Tournament metadata follows the project's FIFA historical scope. The match archive is prepared from the public-domain OpenFootball World Cup JSON datasets.

Historical archive preparation records source/provenance information and materializes local static data. Runtime football-data API calls are not required.

The historical archive is prepared into per-tournament static files so the application can load only the selected played edition. The modeled not-held editions do not trigger a data fetch.

## Architecture

```
World Cup static data
        ↓
Historical archive + 2026 registry
        ↓
Historical explorers / Tactical State
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
Hypothetical Match Result
        ↓
Tactical Report + Player Ratings
```

The app intentionally has no backend, database, authentication, live match feeds, news, fantasy, betting or generic league selector.

## Local development

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Data preparation

The normal development/build flow prepares the current 2026 registry and historical archive.

Prepare the historical archive independently:

```bash
npm run prepare:historical
```

Refresh the 2026 registry:

```bash
FORCE_DATA_REFRESH=1 npm run prepare:data
```

The 2026 sync validates the expected 48 teams and 1,248 players instead of silently generating an incomplete snapshot.

Historical data can use a fixed snapshot date through `HISTORICAL_DATA_DATE`. The normal build reuses an existing generated snapshot where supported; an explicit refresh should be used when the source data needs to be regenerated.

## Testing and release verification

Run the test suite:

```bash
npm test
```

Run the production build:

```bash
npm run build
```

Preview the production output:

```bash
npm run preview
```

A release verification should use a clean checkout and execute, in order:

1. `npm install`
2. `npm test`
3. `npm run build`
4. `npm run preview`
5. Open the historical explorer and verify a played edition loads its local data.
6. Verify 1942 and 1946 display as not held without requesting match data.
7. Verify the 2026 Tactical XI flow still loads the 2026 registry and can run a hypothetical simulation.
8. Verify historical match records remain visually distinct from simulated results.

## GitHub Pages

The project currently deploys the Vite site from `main` through GitHub Actions.

The deployment prepares the static datasets, runs tests, builds the Vite application with the repository Pages base path, uploads `dist/`, and deploys the Pages artifact.

Enable **Settings → Pages → Source → GitHub Actions** for a repository Pages deployment.

## Known data limitations

- Historical squad/player evidence is less complete than the tournament and match archive.
- Reconstructed historical tactical roles are not official records unless directly sourced.
- Venue, date and other match fields can be unavailable in the source archive.
- The historical archive is not an official FIFA ratings or prediction dataset.
- Simulated scores, xG, events and player ratings are hypothetical outputs from the application's rules-based model.

## Deployment/data refresh notes

Historical data is build-time/static data. Refreshing the archive should be treated as a data snapshot operation, with provenance and retrieval dates retained.

The production asset path is determined by the Vite Pages base path in `vite.config.ts`. Do not publish the source tree as the production artifact; the deployable site is the compiled `dist/` output.

## Disclaimer

Every match generated by Tactical XI is a **hypothetical simulation**. Scores, xG, events and player ratings generated by the app's tactical model are not official FIFA predictions, ratings or match records. Historical match records in the archive are sourced records and remain separate from simulated outcomes.
