const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['training', 'tournament', 'social', 'workshop', 'other'],
    default: 'other'
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  coverImage: {
    type: String,
    default: null
  },
  participants: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'pending'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

eventSchema.methods.isFull = function() {
  if (!this.maxParticipants) return false;
  
  const confirmedCount = this.participants.filter(p => p.status === 'confirmed').length;
  return confirmedCount >= this.maxParticipants;
};

eventSchema.methods.getConfirmedCount = function() {
  return this.participants.filter(p => p.status === 'confirmed').length;
};

eventSchema.virtual('isPast').get(function() {
  return new Date() > this.date;
});

eventSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Event', eventSchema);
