const mongoose = require('mongoose');

// Singleton document — only one record ever exists
const spotifyConfigSchema = new mongoose.Schema({
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiresAt: { type: Date },
  playlistId: { type: String },
  playlistName: { type: String },
  playlistUrl: { type: String },
  playlistImageUrl: { type: String },
  connectedAt: { type: Date },
}, { timestamps: true });

spotifyConfigSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.__v; return ret; }
});

module.exports = mongoose.model('SpotifyConfig', spotifyConfigSchema);
