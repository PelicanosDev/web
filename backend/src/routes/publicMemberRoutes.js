const express = require('express');
const router = express.Router();
const { getPublicMemberById } = require('../controllers/memberController');

router.get('/:id', getPublicMemberById);

module.exports = router;
