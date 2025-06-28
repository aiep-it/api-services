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
const express = require('express');
const router = express.Router();

// Middleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const nodeController = require('../controllers/roadmap/node.controller');
const validateRequest = require('../middleware/validateRequest');
const { createNodeSchema } = require('../validations/nodeRequest');

router.post('/', protect, authorizeRoles(['admin', 'staff']), validateRequest(createNodeSchema), nodeController.createNode);

module.exports = router;