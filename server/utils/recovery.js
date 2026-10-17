/**
 * Recovery score (0-100) from three signals:
 *  - Sleep      (50 pts): last night's hours vs. the user's sleep goal
 *  - Rest days  (20 pts): days off in the previous 3 days
 *  - Load       (30 pts): average intensity (1-10) of workouts in the previous 3 days
 */
const { addDays } = require('./dates');

function computeRecovery({ today, sleepEntry, workouts, sleepGoal = 8 }) {
  const prev3 = [1, 2, 3].map((n) => addDays(today, -n));
  const past = workouts.filter((w) => prev3.includes(w.date));
  const trainedDays = new Set(past.map((w) => w.date));

  const hours = sleepEntry ? sleepEntry.hours : null;
  const sleepScore = hours === null ? 25 : Math.min(hours / sleepGoal, 1) * 50;

  const restDays = 3 - trainedDays.size;
  const restScore = (restDays / 3) * 20;

  const avgIntensity = past.length ? past.reduce((s, w) => s + (w.intensity || 6), 0) / past.length : 0;
  const loadScore = past.length ? 30 * (1 - avgIntensity / 10) : 30;

  const score = Math.round(sleepScore + restScore + loadScore);

  let status, advice;
  if (score >= 75) {
    status = 'Ready';
    advice = 'You are well recovered. A hard session is a good call today.';
  } else if (score >= 50) {
    status = 'Moderate';
    advice = 'Train, but keep intensity moderate or focus on technique.';
  } else {
    status = 'Rest';
    advice = 'Recovery is low. Take a rest day or do light mobility work.';
  }

  return {
    score,
    status,
    advice,
    breakdown: {
      sleep: Math.round(sleepScore),
      rest: Math.round(restScore),
      load: Math.round(loadScore),
      sleepHours: hours,
      restDays,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
    },
  };
}

module.exports = { computeRecovery };
