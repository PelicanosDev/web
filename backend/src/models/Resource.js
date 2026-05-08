const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['document', 'video'], required: true },
    category: {
      type: String,
      enum: ['policy', 'regulation', 'form', 'announcement', 'home_workout', 'technique', 'warmup', 'other'],
      default: 'other',
    },
    fileUrl: String,
    publicId: String,
    videoUrl: String,
    isPublic: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
