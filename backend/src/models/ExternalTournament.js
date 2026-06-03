const mongoose = require('mongoose');

const externalTournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  imageUrl: {
    type: String
  },
  publicId: {
    type: String
  },
  location: {
    type: String,
    trim: true
  },
  date: {
    type: Date
  },
  endDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['arena_tour', 'copa_rookies', 'liga', 'rey_de_cancha', 'otro'],
    default: 'otro'
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  result: {
    type: String,
    trim: true
  },
  position: {
    type: Number
  },
  participants: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

externalTournamentSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('ExternalTournament', externalTournamentSchema);
