const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  defaultUnit: {
    type: String,
    required: [true, 'Default unit is required'],
    enum: ['cm', 'metros', 'segundos', 'minutos', 'kg', 'repeticiones', 'km/h'],
    default: 'cm'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['fuerza', 'velocidad', 'resistencia', 'tecnica', 'flexibilidad', 'potencia'],
    default: 'fuerza'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

exerciseSchema.index({ name: 1 });
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ isActive: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
