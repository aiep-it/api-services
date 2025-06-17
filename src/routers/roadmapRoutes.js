// src/routers/roadmapRoutes.js
const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware'); // Middleware xác thực người dùng
const { authorizeRoles } = require('../middleware/authMiddleware'); // Middleware phân quyền (Admin/Staff)
const { toggleRoadmapBookmark } = require('../controllers/userController');


// Lấy tất cả Roadmaps (có thể kèm tiến độ nếu user đăng nhập)
// router.get('/', protect, roadmapController.getAllRoadmaps); // Protect để req.user có thể chứa thông tin user
router.get('/', protect,roadmapController.getAllRoadmaps); // Protect để req.user có thể chứa thông tin user

// Lấy Roadmap theo ID (có thể kèm tiến độ nếu user đăng nhập)
router.get('/:id', protect, roadmapController.getRoadmapById);

// Admin/Staff: Tạo Roadmap mới
router.post('/', protect, authorizeRoles(['admin', 'staff']), roadmapController.createRoadmap);

// Admin/Staff: Cập nhật Roadmap
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.updateRoadmap);

// Admin/Staff: Xóa mềm Roadmap
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.deleteRoadmap);

// User: Đánh dấu Node đã hoàn thành
router.post('/nodes/:nodeId/complete', protect, roadmapController.completeNode);

// Admin/Staff: Tạo Node mới 
router.post('/:roadmapId/nodes', protect, authorizeRoles(['admin', 'staff']), roadmapController.createNode); // thử nghiệm 


router.post('/:roadmapId/bookmark', protect, toggleRoadmapBookmark); // Endpoint bookmark/unbookmark

module.exports = router;