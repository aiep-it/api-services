
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const wordspaceController = require('../controllers/wordspace.controller');

router.use(protect);

/**
 * @swagger
 * /wordspace:
 *   get:
 *     summary: Get the user's wordspace
 *     tags: [Wordspace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's wordspace
 *       401:
 *         description: Unauthorized
 */
router.get('/', wordspaceController.getWordSpace);

/**
 * @swagger
 * /wordspace/topics:
 *   post:
 *     summary: Add a topic to the user's wordspace
 *     tags: [Wordspace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Topic added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/topics', wordspaceController.addTopic);

/**
 * @swagger
 * /wordspace/topics/{topicId}/vocabs:
 *   post:
 *     summary: Add a vocabulary to a topic in the user's wordspace
 *     tags: [Wordspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               meaning:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vocabulary added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/topics/:topicId/vocabs', wordspaceController.addVocab);

/**
 * @swagger
 * /wordspace/topics/{topicId}/vocabs/bulk:
 *   post:
 *     summary: Add multiple vocabularies to a topic in the user's wordspace
 *     tags: [Wordspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vocabs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     word:
 *                       type: string
 *                     meaning:
 *                       type: string
 *     responses:
 *       201:
 *         description: Vocabularies added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/topics/:topicId/vocabs/bulk', wordspaceController.addMultipleVocabs);

module.exports = router;
