    // src/routers/categoryRoutes.js
    const express = require('express');
    const router = express.Router();
    const categoryController = require('../controllers/categoryController');
    const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Đảm bảo đã import


      // User/Guest: Lấy tất cả Categories
    router.get('/', categoryController.getAllCategories);

    // Admin/Staff: Tạo Category mới
    router.post('/', protect, authorizeRoles(['admin', 'staff']), categoryController.createCategory);

    // Admin/Staff: Cập nhật Category
    router.put('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.updateCategory);

    // Admin/Staff: Xóa Category
    router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.deleteCategory);

    module.exports = router;
    
