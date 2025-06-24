const express = require('express');
const router = express.Router();

// Controllers
const roadmapController = require('../controllers/roadmap/roadmap.controller');
const nodeController = require('../controllers/roadmap/node.controller');
const bookmarkController = require('../controllers/roadmap/bookmark.controller');

// Middleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Người dùng: Xem roadmap
router.get('/', protect, roadmapController.getAllRoadmaps);
router.get('/:id', protect, roadmapController.getRoadmapById);

// Admin/Staff: Tạo, cập nhật, xóa roadmap
router.post('/', protect, authorizeRoles(['admin', 'staff']), roadmapController.createRoadmap);
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.updateRoadmap);
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.deleteRoadmap);

// Node: Đánh dấu hoàn thành
router.post('/nodes/:nodeId/complete', protect, nodeController.completeNode);

// // Node: Tạo node mới
// router.post('/nodes', protect, authorizeRoles(['admin', 'staff']), nodeController.createNode);

// // Bookmark toggle (có thể dùng từ user route hoặc roadmap)
// router.post('/:id/bookmark', protect, bookmarkController.toggleBookmarkRoadmap);

module.exports = router;
