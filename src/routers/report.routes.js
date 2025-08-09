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

module.exports = router;
