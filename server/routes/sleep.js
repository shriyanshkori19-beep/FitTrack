const router = require('express').Router();
const Sleep = require('../models/Sleep');
const auth = require('../middleware/auth');
const { isDate } = require('../utils/dates');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 200);
    res.json(await Sleep.find({ user: req.user._id }).sort({ date: -1 }).limit(limit));
  } catch (err) { next(err); }
});

// One entry per day: logging the same date again updates it
router.post('/', async (req, res, next) => {
  try {
    const { date, hours, quality } = req.body;
    if (!isDate(date)) return res.status(400).json({ message: 'A valid date is required' });
    if (hours === undefined || hours === '' || Number(hours) < 0 || Number(hours) > 24) {
      return res.status(400).json({ message: 'Hours must be between 0 and 24' });
    }
    const entry = await Sleep.findOneAndUpdate(
      { user: req.user._id, date },
      { hours: Number(hours), quality: Number(quality) || 3 },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Sleep.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Entry not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
