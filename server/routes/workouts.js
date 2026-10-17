const router = require('express').Router();
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');
const { isDate } = require('../utils/dates');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 }).limit(limit);
    res.json(workouts);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { date, title, intensity, duration, exercises } = req.body;
    if (!isDate(date)) return res.status(400).json({ message: 'A valid date is required' });
    const clean = (exercises || [])
      .filter((e) => e.name && e.name.trim())
      .map((e) => ({
        name: e.name,
        sets: (e.sets || []).map((s) => ({ reps: Number(s.reps) || 0, weight: Number(s.weight) || 0 })),
      }));
    const workout = await Workout.create({
      user: req.user._id, date, title: title || 'Workout',
      intensity: Number(intensity) || 6, duration: Number(duration) || 0, exercises: clean,
    });
    res.status(201).json(workout);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Workout not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
