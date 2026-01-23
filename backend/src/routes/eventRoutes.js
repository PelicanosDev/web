const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerToEvent
} = require('../controllers/eventController');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/:id/register', authenticate, registerToEvent);

router.use(authenticate);
router.use(authorize('admin', 'coach'));

router.post('/', upload.single('coverImage'), createEvent);
router.put('/:id', upload.single('coverImage'), updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
