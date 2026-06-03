const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAuthUrl,
  handleCallback,
  getStatus,
  disconnect,
  searchTracks,
  getPlaylist,
  addTrack,
  removeTrack,
} = require('../controllers/spotifyController');

// Public / member routes (require authentication)
router.get('/playlist', authenticate, getPlaylist);
router.get('/search', authenticate, searchTracks);
router.post('/tracks', authenticate, addTrack);

// Admin only
router.get('/auth-url', authenticate, authorize('admin', 'coach'), getAuthUrl);
router.post('/callback', authenticate, authorize('admin', 'coach'), handleCallback);
router.get('/status', authenticate, authorize('admin', 'coach'), getStatus);
router.delete('/disconnect', authenticate, authorize('admin', 'coach'), disconnect);
router.delete('/tracks', authenticate, authorize('admin', 'coach'), removeTrack);

module.exports = router;
