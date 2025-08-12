const express = require('express');
const roadmapController = require('../controllers/roadmap/roadmap.controller');
const topicController = require('../controllers/topic/topic.controller');
const bookmarkController = require('../controllers/roadmap/bookmark.controller');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createRoadmapSchema } = require('../validations/roadmapRequest');

const router = express.Router();

// Controllers

// Middleware

/**
 * @swagger
 * tags:
 *   name: Roadmaps
 *   description: Roadmap management
 */

/**
 * @swagger
 * /roadmaps:
 *   get:
 *     summary: Get all roadmaps
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of roadmaps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   categoryId:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal Server Error
 */
router.get('/', protect, roadmapController.getAllRoadmaps);

/**
 * @swagger
 * /roadmaps/{id}:
 *   get:
 *     summary: Get a roadmap by ID
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the roadmap
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single roadmap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Roadmap not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', roadmapController.getRoadmapById);

/**
 * @swagger
 * /roadmaps:
 *   post:
 *     summary: Create a new roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the roadmap
 *               description:
 *                 type: string
 *                 description: Description of the roadmap
 *               categoryId:
 *                 type: string
 *                 description: ID of the category the roadmap belongs to
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Roadmap created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.post('/', protect, authorizeRoles(['admin', 'staff']), validateRequest(createRoadmapSchema), roadmapController.createRoadmap);

/**
 * @swagger
 * /roadmaps/{id}:
 *   put:
 *     summary: Update a roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the roadmap
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
 *                 description: Name of the roadmap
 *               description:
 *                 type: string
 *                 description: Description of the roadmap
 *               categoryId:
 *                 type: string
 *                 description: ID of the category the roadmap belongs to
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Roadmap updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Roadmap not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.updateRoadmap);

/**
 * @swagger
 * /roadmaps/{id}:
 *   delete:
 *     summary: Delete a roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the roadmap
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Roadmap deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Roadmap not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), roadmapController.deleteRoadmap);

/**
 * @swagger
 * /roadmaps/topics/{topicId}/complete:
 *   post:
 *     summary: Mark a topic as complete
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: topicId
 *         in: path
 *         required: true
 *         description: The ID of the topic
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic marked as complete successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Topic marked as completed."
 *                 topicProgress:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     topicId:
 *                       type: string
 *                     isCompleted:
 *                       type: boolean
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                 roadmapId:
 *                   type: string
 *                 updatedRoadmapProgressPercentage:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/topics/:topicId/complete', protect, topicController.completeTopic);

// Uncomment if needed
// router.post('/nodes', protect, authorizeRoles(['admin', 'staff']), nodeController.createNode);
// router.post('/:id/bookmark', protect, bookmarkController.toggleBookmarkRoadmap);

module.exports = router;
