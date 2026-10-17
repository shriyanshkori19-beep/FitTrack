const router = require('express').Router();
const Workout = require('../models/Workout');
const Sleep = require('../models/Sleep');
const Nutrition = require('../models/Nutrition');
const auth = require('../middleware/auth');
const { isDate, addDays, startOfWeek, range, serverToday } = require('../utils/dates');
const { computeRecovery } = require('../utils/recovery');

router.use(auth);

// GET /api/dashboard?today=YYYY-MM-DD  (client sends its local date)
router.get('/', async (req, res, next) => {
  try {
    const today = isDate(req.query.today) ? req.query.today : serverToday();
    const user = req.user;
    const since = addDays(today, -59);

    const [workouts, sleeps, meals] = await Promise.all([
      Workout.find({ user: user._id, date: { $gte: since, $lte: today } }),
      Sleep.find({ user: user._id, date: { $gte: since, $lte: today } }),
      Nutrition.find({ user: user._id, date: today }),
    ]);

    // Recovery
    const sleepEntry = sleeps.find((s) => s.date === today) || null;
    const recovery = computeRecovery({ today, sleepEntry, workouts, sleepGoal: user.sleepGoal });

    // Streak: consecutive training days. Today not yet logged doesn't break it.
    const trained = new Set(workouts.map((w) => w.date));
    let cursor = trained.has(today) ? today : addDays(today, -1);
    let streak = 0;
    while (trained.has(cursor)) { streak++; cursor = addDays(cursor, -1); }

    // Weekly goal (Mon-Sun)
    const weekStart = startOfWeek(today);
    const weekDays = range(addDays(weekStart, 6), 7);
    const weekDone = weekDays.filter((d) => trained.has(d)).length;

    // Chart series
    const volByDate = {};
    workouts.forEach((w) => { volByDate[w.date] = (volByDate[w.date] || 0) + w.totalVolume; });
    const sleepByDate = Object.fromEntries(sleeps.map((s) => [s.date, s.hours]));

    const last14 = range(today, 14);
    const volumeSeries = last14.map((d) => ({ date: d.slice(5), volume: Math.round(volByDate[d] || 0) }));
    const sleepSeries = last14.map((d) => ({ date: d.slice(5), hours: sleepByDate[d] ?? null }));

    const attendance = range(today, 28).map((d) => ({ date: d, trained: trained.has(d) }));

    const nutritionToday = meals.reduce(
      (t, m) => ({ calories: t.calories + m.calories, protein: t.protein + m.protein, carbs: t.carbs + m.carbs, fat: t.fat + m.fat }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({
      today,
      recovery,
      streak,
      weekly: { done: weekDone, goal: user.weeklyGoal, days: weekDays.map((d) => ({ date: d, trained: trained.has(d) })) },
      volumeSeries,
      sleepSeries,
      attendance,
      nutritionToday,
      totals: {
        workouts: workouts.length,
        volume30: Math.round(workouts.filter((w) => w.date >= addDays(today, -29)).reduce((s, w) => s + w.totalVolume, 0)),
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
