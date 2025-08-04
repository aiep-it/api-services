const express = require('express');
const router = express.Router();
const classController = require('../controllers/class/class.controller');
const { protect } = require('../middleware/authMiddleware');
router.get('/',protect, classController.getAllClasses);
router.post('/',protect, classController.createClass);
router.get('/:id',protect, classController.getClassById);
router.put('/:id',protect, classController.updateClass);
router.delete('/:id', protect,classController.deleteClass);

router.patch('/:id/add-teacher', protect,classController.addTeacherToClass);
router.patch('/:id/remove-teacher', protect,classController.removeTeacherFromClass);
router.patch('/:id/add-students',protect, classController.addStudentsToClass);
router.delete('/:id/remove-student/:studentId', protect,classController.removeStudentFromClass);
router.patch('/:id/remove-roadmap', protect,classController.removeRoadmapFromClass);
router.post('/:id/roadmaps',protect, classController.addRoadmapToClass);

module.exports = router;
