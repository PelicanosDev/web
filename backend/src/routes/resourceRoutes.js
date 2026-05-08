const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { anyFileUpload } = require('../middlewares/upload');
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');

router.get('/', getAllResources);
router.get('/:id', getResourceById);

router.use(authenticate);
router.use(authorize('admin', 'coach'));

router.post('/', anyFileUpload.single('file'), createResource);
router.put('/:id', anyFileUpload.single('file'), updateResource);
router.delete('/:id', deleteResource);

module.exports = router;
