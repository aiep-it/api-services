/**
 * @swagger
 * tags:
 *   name: Nodes
 *   description: API endpoints for managing nodes
 */

/**
 * @swagger
 * /nodes:
 *   post:
 *     summary: Create a new node
 *     tags: [Nodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Node'
 *     responses:
 *       201:
 *         description: Node created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /nodes/{nodeId}:
 *   get:
 *     summary: Retrieve a node by ID
 *     tags: [Nodes]
 *     parameters:
 *       - name: nodeId
 *         in: path
 *         required: true
 *         description: The ID of the node to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Node retrieved successfully
 *       404:
 *         description: Node not found
 */

/**
 * @swagger
 * /nodes/{nodeId}:
 *   put:
 *     summary: Update a node by ID
 *     tags: [Nodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: nodeId
 *         in: path
 *         required: true
 *         description: The ID of the node to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Node'
 *     responses:
 *       200:
 *         description: Node updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Node not found
 *       403:
 *         description: Forbidden
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const nodeController = require('../controllers/roadmap/node.controller');
const validateRequest = require('../middleware/validateRequest');
const { createNodeSchema, updateNodeSchema } = require('../validations/nodeRequest');

router.post('/', protect, authorizeRoles(['admin', 'staff']), validateRequest(createNodeSchema), nodeController.createNode);

router.get('/:nodeId', nodeController.getNodeById);

router.get('/list/:roadmapId', nodeController.getNodesByRoadmapId); //TODO pagging request

router.put('/:nodeId', protect, authorizeRoles(['admin', 'staff']), validateRequest(updateNodeSchema), nodeController.updateNode);

module.exports = router;