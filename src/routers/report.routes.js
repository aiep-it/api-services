const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reports management
 */

/**
 * @swagger
 * /reports/self:
 *   get:
 *     summary: Get a self-report of progress
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The self-report
 */
router.get('/self', protect, ReportController.getSelfReport);

/**
 * @swagger
 * /reports/exercise-results/user/{userId}:
 *   get:
 *     summary: Get exercise result report by user
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The exercise result report
 */
router.get('/exercise-results/user/:userId', ReportController.getExerciseResultReportByUser);

/**
 * @swagger
 * /reports/exercise-results/user/{userId}/topic/{topicId}:
 *   get:
 *     summary: Get exercise result report by user and topic
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: path
 *         name: topicId
 *         schema:
 *           type: string
 *         required: true
 *         description: The topic ID
 *     responses:
 *       200:
 *         description: The exercise result report
 */
router.get('/exercise-results/user/:userId/topic/:topicId', ReportController.getExerciseResultReportByUserAndTopic);

/**
 * @swagger
 * /reports/exercise-results/topic/{topicId}:
 *   get:
 *     summary: Get exercise result report by topic
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: topicId
 *         schema:
 *           type: string
 *         required: true
 *         description: The topic ID
 *     responses:
 *       200:
 *         description: The exercise result report
 */
router.get('/exercise-results/topic/:topicId', ReportController.getExerciseResultReportByTopic);

/**
 * @swagger
 * /reports/overview:
 *   get:
 *     summary: Get a course overview for the authenticated user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The course overview
 */
router.get('/course-overview', protect, ReportController.getCourseOverview);

/**
 * @swagger
 * /reports/class/{classId}:
 *   get:
 *     summary: Get a report for a specific class by a teacher
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the class to get the report for
 *     responses:
 *       200:
 *         description: The class report
 *       403:
 *         description: 'Forbidden: User is not a teacher for this class'
 *       404:
 *         description: 'Class not found'
 */
router.get('/class/:classId', protect, ReportController.getClassReport);

/**
 * @swagger
 * /reports/class/{classId}/topic/{topicId}:
 *   get:
 *     summary: Get a report for a specific topic within a class by a teacher
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the class
 *       - in: path
 *         name: topicId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the topic
 *     responses:
 *       200:
 *         description: The class and topic report
 *       403:
 *         description: 'Forbidden: User is not a teacher for this class'
 *       404:
 *         description: 'Class or Topic not found, or Topic not associated with class'
 */
router.get('/class/:classId/topic/:topicId', protect, ReportController.getClassTopicReport);

/**
 * @swagger
 * /reports/class/{classId}/student/{studentId}:
 *   get:
 *     summary: Get a report for a specific student within a class by a teacher
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the class
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the student
 *     responses:
 *       200:
 *         description: The student's report within the class
 *       403:
 *         description: 'Forbidden: User is not a teacher for this class'
 *       404:
 *         description: 'Class or Student not found, or Student not in class'
 */
router.get('/class/:classId/student/:studentId', protect, ReportController.getStudentClassReport);

module.exports = router;
