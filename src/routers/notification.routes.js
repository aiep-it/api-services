const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notification/notification.controller');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API for managing user notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "notif_123"
 *                   userId:
 *                     type: string
 *                     example: "user_abc"
 *                   message:
 *                     type: string
 *                     example: "Your topic 'Introduction to AI' is now available."
 *                   read:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/', ctrl.listMyNotifications);
router.patch('/:id/read', ctrl.markAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal Server Error
 */

module.exports = router;
