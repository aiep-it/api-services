// api-services/routers/webhookRouter.js
const express = require('express');
const router = express.Router();
const { webhookHandler } = require('../controllers/webhook.controller');

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook management
 */

/**
 * @swagger
 * /webhooks/clerk:
 *   post:
 *     summary: Handle Clerk webhook events
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Clerk webhook event payload
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 *       400:
 *         description: Bad request (e.g., invalid payload)
 *       500:
 *         description: Internal Server Error
 */
router.post('/clerk', webhookHandler);

module.exports = router;