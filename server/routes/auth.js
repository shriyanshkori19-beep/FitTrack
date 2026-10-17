const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, weeklyGoal: u.weeklyGoal, sleepGoal: u.sleepGoal });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.matchPassword(password || ''))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    res.json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get('/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

router.put('/goals', auth, async (req, res, next) => {
  try {
    const { weeklyGoal, sleepGoal } = req.body;
    if (weeklyGoal !== undefined) req.user.weeklyGoal = Math.min(7, Math.max(1, Number(weeklyGoal)));
    if (sleepGoal !== undefined) req.user.sleepGoal = Math.min(12, Math.max(4, Number(sleepGoal)));
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (err) { next(err); }
});

module.exports = router;
