const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notification/notification.controller');

router.get('/', ctrl.listMyNotifications);
router.patch('/:id/read', ctrl.markAsRead);

module.exports = router;
