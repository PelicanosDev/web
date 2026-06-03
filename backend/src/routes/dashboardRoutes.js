const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getDashboardStats,
  getMembershipGrowth,
  getRecentRegistrations,
  getUpcomingEvents,
  getNextBirthdays
} = require('../controllers/dashboardController');

router.use(authenticate);
router.use(authorize('admin', 'coach'));

router.get('/stats', getDashboardStats);
router.get('/growth', getMembershipGrowth);
router.get('/recent', getRecentRegistrations);
router.get('/events', getUpcomingEvents);
router.get('/birthdays', getNextBirthdays);

module.exports = router;
