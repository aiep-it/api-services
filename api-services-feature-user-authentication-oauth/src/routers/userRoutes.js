const express = require('express');
const router = express.Router();

const {
  updateUserMetadata,
  getCurrentUserRole,
  getAllUsers,
  getUserByClerkId,
  getUserMetrics,
  toggleRoadmapBookmark,
  getLearningRoadmaps,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng và quyền
 */

/**
 * @swagger
 * /api/users/update-metadata:
 *   post:
 *     summary: Cập nhật metadata người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Metadata updated
 */
router.post('/update-metadata', protect, authorizeRoles(['admin']), updateUserMetadata);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Lấy vai trò người dùng hiện tại
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vai trò người dùng
 */
router.get('/me', protect, getCurrentUserRole);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy tất cả người dùng (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
router.get('/', protect, authorizeRoles(['admin']), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy người dùng theo Clerk ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 */
router.get('/:id', protect, authorizeRoles(['admin']), getUserByClerkId);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã cập nhật user
 */
router.put('/:id', protect, authorizeRoles(['admin']), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xoá user theo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xoá thành công
 */
router.delete('/:id', protect, authorizeRoles(['admin']), deleteUser);

/**
 * @swagger
 * /api/users/me/metrics:
 *   get:
 *     summary: Lấy thống kê học tập của người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thống kê
 */
router.get('/me/metrics', protect, getUserMetrics);

/**
 * @swagger
 * /api/users/me/learning-roadmaps:
 *   get:
 *     summary: Lấy danh sách roadmap đã bookmark
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách roadmap
 */
router.get('/me/learning-roadmaps', protect, getLearningRoadmaps);

/**
 * @swagger
 * /api/users/me/bookmarks/{roadmapId}:
 *   post:
 *     summary: Bookmark hoặc bỏ bookmark roadmap
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roadmapId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookmark:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trạng thái bookmark đã cập nhật
 */
router.post('/me/bookmarks/:roadmapId', protect, toggleRoadmapBookmark);

module.exports = router;
