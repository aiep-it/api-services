const express = require('express');
const router = express.Router();

// Controllers (refactor)
const userController = require('../controllers/user/user.controller');
const meController = require('../controllers/user/me.controller');
const metadataController = require('../controllers/user/metadata.controller');
const bookmarkController = require('../controllers/roadmap/bookmark.controller');

// Middleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ===== ORDER MATTERS =====
// Luôn đặt route cụ thể như /me/... trước /:id để tránh conflict

// 1. Admin cập nhật metadata người dùng
router.post('/update-metadata', protect, authorizeRoles(['admin']), metadataController.updateUserMetadata);

// 2. Lấy role hiện tại (Clerk ID)
router.get('/me', protect, meController.getCurrentUserRole);

// 3. Lấy metrics người dùng hiện tại
router.get('/me/metrics', protect, meController.getUserMetrics);

// 4. Lấy roadmap đã bookmark (learning-roadmaps)
router.get('/me/learning-roadmaps', protect, userController.getLearningRoadmaps);

// 5. Toggle bookmark roadmap
router.post('/:roadmapId/bookmark', protect, bookmarkController.toggleBookmarkRoadmap); // Endpoint bookmark/unbookmark

// 6. Admin: Lấy toàn bộ user
router.get('/', protect, authorizeRoles(['admin']), userController.getAllUsers);

// 7. Admin: Lấy user theo Clerk ID
router.get('/:id', protect, authorizeRoles(['admin']), userController.getUserByClerkId);

// router.post('/me/bookmarks/:roadmapId', protect, userController.toggleRoadmapBookmark);

module.exports = router;
