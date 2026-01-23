const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge
} = require('../controllers/badgeController');

router.get('/', getAllBadges);
router.get('/:id', getBadgeById);

router.use(authenticate);
router.use(authorize('admin'));

router.post('/', createBadge);
router.put('/:id', updateBadge);
router.delete('/:id', deleteBadge);

module.exports = router;
