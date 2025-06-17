const express = require('express');
const router = express.Router();
const {
  updateUserMetadata,
  getCurrentUserRole,
  getAllUsers,
  getUserByClerkId,
  getUserMetrics,
  toggleRoadmapBookmark,
  getLearningRoadmaps

} = require('../controllers/userController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/update-metadata', protect, authorizeRoles(['admin']), updateUserMetadata); // chỉ admin được cập nhật metadata
router.get('/me', protect, getCurrentUserRole); // cần xác thực
router.get('/', protect, authorizeRoles(['admin']), getAllUsers); // chỉ admin

router.get('/:id', protect, authorizeRoles(['admin']), getUserByClerkId); // chỉ admin
router.get('/me/metrics', protect, getUserMetrics);
router.get('/me/learning-roadmaps', protect, getLearningRoadmaps); // lấy roadmap đã bookmark của user

router.post('/me/bookmarks/:roadmapId', protect, toggleRoadmapBookmark);


module.exports = router;


// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const validateRequest = require('../midleware/validateRequest')
// const { createUserSchema } = require('../validations/userRequest');


// router.get('/', userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.post('/',validateRequest(createUserSchema) ,userController.createUser);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

// module.exports = router;
// api-services/routers/userRouter.js