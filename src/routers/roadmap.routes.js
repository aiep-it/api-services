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
 *     responses:
 *       201:
 *         description: Roadmap created
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
 *     responses:
 *       200:
 *         description: Roadmap updated
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
 *         description: Roadmap deleted
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
 *         description: Topic marked as complete
 */
router.post('/topics/:topicId/complete', protect, topicController.completeTopic);

// Uncomment if needed
// router.post('/nodes', protect, authorizeRoles(['admin', 'staff']), nodeController.createNode);
// router.post('/:id/bookmark', protect, bookmarkController.toggleBookmarkRoadmap);

module.exports = router;
