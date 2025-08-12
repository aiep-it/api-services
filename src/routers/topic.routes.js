/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: API endpoints for managing topics
 */

/**
 * @swagger
 * /topics:
 *   post:
 *     summary: Create a new topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Topic'
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /topics/{topicId}:
 *   get:
 *     summary: Retrieve a topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - name: topicId
 *         in: path
 *         required: true
 *         description: The ID of the topic to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Topic not found
 */

/**
 * @swagger
 * /topics/{topicId}:
 *   put:
 *     summary: Update a topic by ID
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: topicId
 *         in: path
 *         required: true
 *         description: The ID of the topic to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Topic'
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Topic not found
 *       403:
 *         description: Forbidden
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const topicController = require('../controllers/topic/topic.controller');
const validateRequest = require('../middleware/validateRequest');
const { createTopicSchema, updateTopicSchema } = require('../validations/topicRequest');

router.post('/', protect, authorizeRoles(['admin', 'staff']), validateRequest(createTopicSchema), topicController.createTopic);

router.get('/:topicId', topicController.getTopicById);

/**
 * @swagger
 * /topics/list/{roadmapId}:
 *   get:
 *     summary: Get topics by roadmap ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: roadmapId
 *         required: true
 *         description: The ID of the roadmap
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of topics for the given roadmap
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Roadmap not found
 */
router.get('/list/:roadmapId', topicController.getTopicsByRoadmapId);

router.put('/:topicId', protect, validateRequest(updateTopicSchema), topicController.updateTopic);

/**
 * @swagger
 * /topics/ai/suggest:
 *   post:
 *     summary: Get AI suggested topics
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt for AI topic suggestion.
 *     responses:
 *       200:
 *         description: AI suggested topics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.post('/ai/suggest', topicController.getSuggestedTopics);

module.exports = router;