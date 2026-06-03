const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { getAll, getAllAdmin, create, update, remove } = require('../controllers/externalTournamentController');

// Public
router.get('/', getAll);

// Admin
router.get('/admin', authenticate, authorize('admin', 'coach'), getAllAdmin);
router.post('/', authenticate, authorize('admin', 'coach'), upload.single('image'), create);
router.put('/:id', authenticate, authorize('admin', 'coach'), upload.single('image'), update);
router.delete('/:id', authenticate, authorize('admin', 'coach'), remove);

module.exports = router;
