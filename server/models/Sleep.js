const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // the morning you woke up, YYYY-MM-DD
    hours: { type: Number, required: true, min: 0, max: 24 },
    quality: { type: Number, min: 1, max: 5, default: 3 },
  },
  { timestamps: true }
);

sleepSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Sleep', sleepSchema);
