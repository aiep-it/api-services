const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { toggleRoadmapBookmark } = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Roadmaps
 *   description: Quản lý roadmap, tiến độ, bookmark và node học tập
 */

/**
 * @swagger
 * /api/roadmaps:
 *   get:
 *     summary: Lấy tất cả roadmap (có thể kèm bookmark và tiến độ nếu có user)
 *     tags: [Roadmaps]
 *     responses:
 *       200:
 *         description: Danh sách roadmap
 */
router.get('/', roadmapController.getAllRoadmaps);

/**
 * @swagger
 * /api/roadmaps/{id}:
 *   get:
 *     summary: Lấy roadmap theo ID
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của roadmap
 *     responses:
 *       200:
 *         description: Thông tin roadmap
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', protect, roadmapController.getRoadmapById);

/**
 * @swagger
 * /api/roadmaps:
 *   post:
 *     summary: Tạo roadmap mới
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, categoryId, type]
 *             properties:
 *               name: { type: string }
 *               categoryId: { type: string }
 *               type: { type: string }
 *               isNew: { type: boolean }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       403:
 *         description: Không có quyền
 */
router.post('/', protect, authorizeRoles(['admin', 'staff']), roadmapController.createRoadmap);

/**
 * @swagger
 * /api/roadmaps/{id}:
 *   put:
 *     summary: Cập nhật roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               type: { type: string }
 *               isNew: { type: boolean }
 *               is_deleted: { type: boolean }
 *               deleted_at: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.updateRoadmap);

/**
 * @swagger
 * /api/roadmaps/{id}:
 *   delete:
 *     summary: Xoá mềm roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Xoá thành công
 */
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.deleteRoadmap);

/**
 * @swagger
 * /api/roadmaps/nodes/{nodeId}/complete:
 *   post:
 *     summary: Đánh dấu node đã hoàn thành
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nodeId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
 */
router.post('/nodes/:nodeId/complete', protect, roadmapController.completeNode);

/**
 * @swagger
 * /api/roadmaps/{roadmapId}/nodes:
 *   post:
 *     summary: Tạo node mới trong roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roadmapId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Tạo node thành công
 */
router.post('/:roadmapId/nodes', protect, authorizeRoles(['admin', 'staff']), roadmapController.createNode);

/**
 * @swagger
 * /api/roadmaps/{roadmapId}/bookmark:
 *   post:
 *     summary: Bookmark hoặc bỏ bookmark roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roadmapId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookmark:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái bookmark
 */
router.post('/:roadmapId/bookmark', protect, toggleRoadmapBookmark);

module.exports = router;
