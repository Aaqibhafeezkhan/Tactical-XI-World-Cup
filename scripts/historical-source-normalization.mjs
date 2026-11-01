export function isCancelledFixture(match) {
  const status = String(match?.status ?? '').trim().toLowerCase();
  return status === 'cancelled' || status === 'canceled';
}

function validateScorePair(value, label, context) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length !== 2 || !value.every(score => Number.isInteger(score) && score >= 0)) {
    throw new Error(`Invalid ${label} score${context ? ` for ${context}` : ''}.`);
  }
  return value;
}

export function normalizeScore(score, context = '') {
  const fullTime = Array.isArray(score) ? score : score?.ft;
  if (!Array.isArray(fullTime)) return null;

  return {
    ft: validateScorePair(fullTime, 'full-time', context),
    aet: validateScorePair(score?.et ?? score?.aet, 'extra-time', context),
    pens: validateScorePair(score?.pens, 'penalty', context),
  };
}

export function normalizeSourceFixtures(fixtures, year) {
  return fixtures.map((match, index) => {
    const context = `World Cup ${year} fixture #${index + 1} (${match.team1} vs ${match.team2})`;
    const score = normalizeScore(match.score, context);
    if (!score && !isCancelledFixture(match)) {
      throw new Error(`${context} has no final score and is not marked canceled.`);
    }
    return { match, index, score };
  });
}
