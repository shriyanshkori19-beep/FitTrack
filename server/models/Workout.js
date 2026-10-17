const mongoose = require('mongoose');

const setSchema = new mongoose.Schema(
  { reps: { type: Number, required: true, min: 0 }, weight: { type: Number, required: true, min: 0 } },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true }, sets: { type: [setSchema], default: [] } },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    title: { type: String, default: 'Workout', trim: true },
    intensity: { type: Number, min: 1, max: 10, default: 6 },
    duration: { type: Number, min: 0, default: 0 }, // minutes
    exercises: { type: [exerciseSchema], default: [] },
    totalVolume: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workoutSchema.index({ user: 1, date: -1 });

// volume = sum of (sets x reps x weight)
workoutSchema.pre('validate', function (next) {
  this.totalVolume = this.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0
  );
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
