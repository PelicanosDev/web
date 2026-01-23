const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['attendance', 'performance', 'achievement', 'special'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['attendance_count', 'win_count', 'tournament_wins', 'level_reached', 'metric_improvement', 'special'],
      required: true
    },
    value: {
      type: Number,
      default: 0
    },
    description: String
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  xpReward: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

badgeSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Badge', badgeSchema);
