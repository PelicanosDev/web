const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  changePassword,
  uploadAvatar
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);
router.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatar);

module.exports = router;
