const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Quản lý danh mục category cho roadmap
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy tất cả category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Danh sách category
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo category mới (admin/staff)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       409:
 *         description: Trùng tên
 */
router.post('/', protect, authorizeRoles(['admin', 'staff']), categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật category (admin/staff)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
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
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       409:
 *         description: Tên đã tồn tại
 */
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Xoá category (admin/staff)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xoá thành công
 *       409:
 *         description: Không thể xoá do ràng buộc khóa ngoại
 */
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.deleteCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Lấy thông tin category theo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về category
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', categoryController.getCategoryById);

module.exports = router;
