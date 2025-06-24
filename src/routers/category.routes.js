const express = require('express');
const router = express.Router();

// Controller
const categoryController = require('../controllers/category/category.controller');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Guest/User: Lấy toàn bộ category
router.get('/', categoryController.getAllCategories);

// Admin/Staff: CRUD
router.post('/', protect, authorizeRoles(['admin', 'staff']), categoryController.createCategory);
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.updateCategory);
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.deleteCategory);

module.exports = router;
