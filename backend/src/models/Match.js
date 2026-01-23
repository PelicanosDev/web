const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  round: {
    type: String,
    required: true
  },
  matchNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  teams: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    isWinner: {
      type: Boolean,
      default: false
    }
  }],
  sets: [{
    setNumber: {
      type: Number,
      required: true
    },
    scores: [{
      type: Number,
      required: true
    }]
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'postponed'],
    default: 'scheduled'
  },
  stats: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

matchSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Match', matchSchema);
