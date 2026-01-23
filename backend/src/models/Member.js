const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  memberNumber: {
    type: String,
    unique: true,
    required: true
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    relation: {
      type: String,
      trim: true
    }
  },
  medicalInfo: {
    eps: {
      type: String,
      trim: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: ''
    },
    allergies: {
      type: String,
      trim: true
    }
  },
  membership: {
    plan: {
      type: String,
      default: 'basic'
    },
    monthlyFee: {
      type: Number,
      default: 150000
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    paymentHistory: [{
      date: {
        type: Date,
        default: Date.now
      },
      amount: Number,
      method: {
        type: String,
        enum: ['cash', 'transfer', 'card', 'other']
      },
      status: {
        type: String,
        enum: ['paid', 'pending', 'overdue'],
        default: 'paid'
      },
      notes: String
    }]
  },
  sportProfile: {
    position: {
      type: String,
      enum: ['Armador', 'Punta', 'Opuesto', 'Central', 'Líbero', 'Universal', ''],
      default: ''
    },
    experience: {
      type: String,
      enum: ['Principiante', 'Intermedio', 'Avanzado', 'Experto', ''],
      default: ''
    },
    height: {
      type: Number
    },
    weight: {
      type: Number
    },
    shirtSize: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', ''],
      default: ''
    },
    pantsSize: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', ''],
      default: ''
    },
    shoeSize: {
      type: Number
    },
    schedule: [{
      type: String
    }]
  },
  additionalInfo: {
    occupation: {
      type: String,
      trim: true
    },
    studyLevel: {
      type: String,
      enum: ['Bachillerato', 'Técnico', 'Tecnólogo', 'Universitario', 'Posgrado', ''],
      default: ''
    }
  },
  socialMedia: {
    instagram: {
      type: String,
      trim: true
    }
  },
  physicalRecords: [{
    date: {
      type: Date,
      default: Date.now
    },
    exercise: {
      type: String,
      required: true,
      trim: true
    },
    result: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['cm', 'metros', 'segundos', 'minutos', 'kg', 'repeticiones', 'km/h'],
      required: true
    },
    times: {
      type: Number,
      default: 1
    },
    notes: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  gamification: {
    level: {
      type: Number,
      default: 1
    },
    xp: {
      type: Number,
      default: 0
    },
    badges: [{
      badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
      },
      earnedAt: {
        type: Date,
        default: Date.now
      },
      progress: {
        type: Number,
        default: 100
      }
    }],
    achievements: [{
      type: {
        type: String
      },
      title: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    present: {
      type: Boolean,
      default: true
    },
    sessionType: {
      type: String,
      enum: ['training', 'match', 'tournament', 'other'],
      default: 'training'
    }
  }],
  matches: [{
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament'
    },
    date: Date,
    result: {
      type: String,
      enum: ['win', 'loss', 'draw']
    },
    stats: {
      points: { type: Number, default: 0 },
      aces: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      digs: { type: Number, default: 0 }
    }
  }],
  gallery: [{
    imageUrl: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  }]
}, {
  timestamps: true
});

memberSchema.methods.calculateAge = function() {
  if (!this.userId || !this.userId.profile || !this.userId.profile.dateOfBirth) {
    return null;
  }
  
  const today = new Date();
  const birthDate = new Date(this.userId.profile.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

memberSchema.methods.addXP = function(amount) {
  this.gamification.xp += amount;
  
  const levelThresholds = [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 25000, 35000];
  
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (this.gamification.xp >= levelThresholds[i]) {
      this.gamification.level = i + 1;
      break;
    }
  }
  
  return this.gamification.level;
};

memberSchema.methods.getAttendanceRate = function() {
  if (this.attendance.length === 0) return 0;
  
  const presentCount = this.attendance.filter(a => a.present).length;
  return Math.round((presentCount / this.attendance.length) * 100);
};

memberSchema.methods.getLatestPhysicalRecord = function() {
  if (this.physicalRecords.length === 0) return null;
  
  return this.physicalRecords.sort((a, b) => b.date - a.date)[0];
};

memberSchema.methods.getFirstPhysicalRecord = function() {
  if (this.physicalRecords.length === 0) return null;
  
  return this.physicalRecords.sort((a, b) => a.date - b.date)[0];
};

memberSchema.virtual('age').get(function() {
  return this.calculateAge();
});

memberSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

memberSchema.pre('save', async function(next) {
  if (this.isNew && !this.memberNumber) {
    const count = await mongoose.model('Member').countDocuments();
    this.memberNumber = `PEL${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
