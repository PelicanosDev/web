const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { mediaUpload } = require('../middlewares/upload');
const {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  createGalleryItemAsMember,
  updateGalleryItem,
  deleteGalleryItem,
  likeGalleryItem,
  tagMembersInPhoto,
  getPhotosByTaggedMember,
  addComment,
  getComments
} = require('../controllers/galleryController');

router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItemById);
router.get('/member/:memberId/tagged', getPhotosByTaggedMember);
router.get('/:id/comments', getComments);
router.post('/:id/like', authenticate, likeGalleryItem);
router.post('/:id/comments', authenticate, addComment);

// Members can upload their own photos
router.post('/member-upload', authenticate, authorize('member', 'admin', 'coach'), mediaUpload.single('media'), createGalleryItemAsMember);

router.use(authenticate);
router.use(authorize('admin', 'coach'));

router.post('/', mediaUpload.single('media'), createGalleryItem);
router.put('/:id', mediaUpload.single('media'), updateGalleryItem);
router.put('/:id/tag', tagMembersInPhoto);
router.delete('/:id', deleteGalleryItem);

module.exports = router;
