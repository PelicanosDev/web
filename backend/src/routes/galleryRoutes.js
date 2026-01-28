const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  likeGalleryItem,
  tagMembersInPhoto,
  getPhotosByTaggedMember
} = require('../controllers/galleryController');

router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItemById);
router.get('/member/:memberId/tagged', getPhotosByTaggedMember);
router.post('/:id/like', authenticate, likeGalleryItem);

router.use(authenticate);
router.use(authorize('admin', 'coach'));

router.post('/', upload.single('image'), createGalleryItem);
router.put('/:id', upload.single('image'), updateGalleryItem);
router.put('/:id/tag', tagMembersInPhoto);
router.delete('/:id', deleteGalleryItem);

module.exports = router;
