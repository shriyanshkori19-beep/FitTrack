const router = require('express').Router();
const Nutrition = require('../models/Nutrition');
const auth = require('../middleware/auth');
const { isDate } = require('../utils/dates');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (isDate(req.query.date)) filter.date = req.query.date;
    res.json(await Nutrition.find(filter).sort({ date: -1, createdAt: 1 }).limit(200));
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { date, meal, calories, protein, carbs, fat } = req.body;
    if (!isDate(date)) return res.status(400).json({ message: 'A valid date is required' });
    if (!meal || calories === undefined || calories === '') return res.status(400).json({ message: 'Meal and calories are required' });
    const entry = await Nutrition.create({
      user: req.user._id, date, meal,
      calories: Number(calories) || 0, protein: Number(protein) || 0,
      carbs: Number(carbs) || 0, fat: Number(fat) || 0,
    });
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Nutrition.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Entry not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
