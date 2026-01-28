const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  addPhysicalRecord,
  assignBadge,
  updateMemberUser,
  permanentlyDeleteMember
} = require('../controllers/memberController');

router.use(authenticate);
router.use(authorize('admin', 'coach'));

router.route('/')
  .get(getAllMembers)
  .post(createMember);

router.route('/:id')
  .get(getMemberById)
  .put(updateMember)
  .delete(deleteMember);

router.put('/:id/user', updateMemberUser);
router.delete('/:id/permanent', authorize('admin'), permanentlyDeleteMember);
router.post('/:id/records', addPhysicalRecord);
router.post('/:id/badges', assignBadge);

module.exports = router;
