const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);

module.exports = router;
