const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  members: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    },
    role: {
      type: String,
      enum: ['captain', 'player'],
      default: 'player'
    }
  }],
  category: {
    type: String,
    enum: ['masculine', 'feminine', 'mixed'],
    required: true
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  logo: {
    type: String
  }
}, {
  timestamps: true
});

teamSchema.methods.getWinRate = function() {
  const totalGames = this.wins + this.losses;
  if (totalGames === 0) return 0;
  return Math.round((this.wins / totalGames) * 100);
};

teamSchema.virtual('totalGames').get(function() {
  return this.wins + this.losses;
});

teamSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Team', teamSchema);
