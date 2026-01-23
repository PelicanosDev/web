const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getMyProfile,
  getMyStats,
  getMyProgress,
  getMyBadges,
  getMyMatches,
  getMyGallery,
  updateMyProfile,
  uploadPersonalPhoto
} = require('../controllers/memberProfileController');

router.use(authenticate);
router.use(authorize('member'));

router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);
router.get('/stats', getMyStats);
router.get('/progress', getMyProgress);
router.get('/badges', getMyBadges);
router.get('/matches', getMyMatches);
router.get('/gallery', getMyGallery);
router.post('/gallery', upload.single('image'), uploadPersonalPhoto);

module.exports = router;
