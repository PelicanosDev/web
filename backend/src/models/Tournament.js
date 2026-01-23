const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['masculine', 'feminine', 'mixed'],
    required: true
  },
  level: {
    type: String,
    enum: ['recreational', 'amateur', 'professional'],
    default: 'recreational'
  },
  format: {
    type: String,
    enum: ['2v2', '4v4', '6v6'],
    default: '4v4'
  },
  modality: {
    type: String,
    enum: ['standard', 'king-of-court', 'round-robin', 'single-elimination', 'double-elimination'],
    default: 'standard',
    required: true
  },
  matchConfig: {
    totalSets: {
      type: Number,
      default: 3,
      min: 1,
      max: 5
    },
    setsToWin: {
      type: Number,
      default: 2,
      min: 1,
      max: 3
    },
    pointsPerSet: {
      type: Number,
      default: 21,
      min: 11,
      max: 30
    },
    finalSetPoints: {
      type: Number,
      default: 15,
      min: 11,
      max: 21
    },
    pointDifference: {
      type: Number,
      default: 2,
      min: 1,
      max: 3
    },
    hasTimeLimit: {
      type: Boolean,
      default: false
    },
    timeLimitMinutes: {
      type: Number,
      default: 0
    }
  },
  dates: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    registrationDeadline: {
      type: Date,
      required: true
    }
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'registration', 'in-progress', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  rules: {
    type: String,
    default: 'Standard beach volleyball rules apply.'
  },
  prizes: [{
    position: {
      type: String,
      required: true
    },
    description: String,
    value: Number
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamName: {
      type: String,
      required: true
    },
    partner: {
      name: String,
      email: String,
      phone: String,
      club: String,
      city: String,
      isMember: {
        type: Boolean,
        default: false
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'confirmed'
    },
    seedPosition: Number,
    bracketPosition: Number
  }],
  teams: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending'
    }
  }],
  bracket: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  matches: [{
    round: String,
    roundNumber: Number,
    matchNumber: Number,
    team1: {
      participantId: mongoose.Schema.Types.ObjectId,
      teamName: String,
      score: [Number]
    },
    team2: {
      participantId: mongoose.Schema.Types.ObjectId,
      teamName: String,
      score: [Number]
    },
    winner: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['pending', 'waiting', 'in-progress', 'completed'],
      default: 'pending'
    },
    scheduledTime: Date,
    court: String,
    nextMatchNumber: Number
  }],
  coverImage: {
    type: String,
    default: null
  },
  gallery: [{
    type: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxTeams: {
    type: Number,
    default: 16
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  requiresApproval: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

tournamentSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  return now < this.dates.registrationDeadline && 
         (this.status === 'registration' || this.status === 'upcoming') &&
         this.participants.length < this.maxTeams;
};

tournamentSchema.methods.getParticipantCount = function() {
  return this.participants.filter(p => p.status === 'confirmed').length;
};

tournamentSchema.methods.getTeamCount = function() {
  return this.teams.filter(t => t.status === 'confirmed').length;
};

tournamentSchema.methods.canRegister = function() {
  return this.isRegistrationOpen() && this.participants.length < this.maxTeams;
};

tournamentSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.dates.start;
});

tournamentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
