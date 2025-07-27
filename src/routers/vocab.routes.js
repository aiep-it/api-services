const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocab/vocab.controller');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { getAllVocabsSchema, createVocabSchema, updateVocabSchema, getVocabsByTopicIdSchema } = require('../validations/vocabRequest');

/**
 * @swagger
 * tags:
 *   name: Vocabs
 *   description: Vocabulary management
 */

/**
 * @swagger
 * /vocabs/{id}:
 *   get:
 *     summary: Get vocab detail
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the vocab to update
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Retrieve a vocab
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/vocabs'
 */

router.get('/:id', protect, authorizeRoles(['admin', 'staff']), vocabController.getVocabById);

/**
 * @swagger
 * /vocabs/search:
 *   post:
 *     summary: Get all vocabs (with pagination, search, filter, and sort)
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number
 *               size:
 *                 type: integer
 *                 default: 10
 *                 description: Number of items per page
 *               search:
 *                 type: string
 *                 description: Search keyword (applied to word, meaning, example)
 *               sort:
 *                 type: array
 *                 description: Sort conditions
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: created_at
 *                     order:
 *                       type: string
 *                       enum: [asc, desc]
 *                       example: desc
 *               filters:
 *                 type: object
 *                 description: "Key-value filter object (e.g., { is_know: true })"
 *                 default:
 *                   is_know: false
 *     responses:
 *       200:
 *         description: A paginated list of vocabs
 */

router.post('/search', protect, authorizeRoles(['admin', 'staff']), validateRequest(getAllVocabsSchema), vocabController.getAllVocabs);
/**
 * @swagger
 * /vocabs:
 *   post:
 *     summary: Create a new vocab
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nodeId
 *               - word
 *               - meaning
 *             properties:
 *               topicId:
 *                 type: string
 *               word:
 *                 type: string
 *               meaning:
 *                 type: string
 *               example:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               is_know:
 *                 type: boolean,
 *                 default: false
 *     responses:
 *       200:
 *         description: Vocab created successfully
 */
router.post('/', protect, authorizeRoles(['admin', 'staff']), validateRequest(createVocabSchema), vocabController.createVocab);

/**
 * @swagger
 * /vocabs/{id}:
 *   put:
 *     summary: Update a vocab
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the vocab to update
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
 *               example:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               is_know:
 *                 type: boolean
 *                 default: false
 *               topicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vocab updated successfully
 */
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), validateRequest(updateVocabSchema), vocabController.updateVocab);

/**
 * @swagger
 * /vocabs/{id}:
 *   delete:
 *     summary: Delete a vocab
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the vocab to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vocab deleted successfully
 */
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), vocabController.deleteVocab);

/**
 * @swagger
 * /vocabs/topic/{topicId}:
 *   post:
 *     summary: Get all vocabs by topic ID with pagination, search, filter, and sort
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         description: The ID of the topic
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number
 *               size:
 *                 type: integer
 *                 default: 10
 *                 description: Number of items per page
 *               search:
 *                 type: string
 *                 description: Search keyword (applied to word, meaning, example)
 *               sort:
 *                 type: array
 *                 description: Sort conditions
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: created_at
 *                     order:
 *                       type: string
 *                       enum: [asc, desc]
 *                       example: desc
 *               filters:
 *                 type: object
 *                 description: "Key-value filter object (e.g., { is_know: true })"
 *                 default:
 *                   is_know: false
 *     responses:
 *       200:
 *         description: A paginated list of vocabs for the given topic
 */
router.post('/topic/:topicId', protect, authorizeRoles(['admin', 'staff']), vocabController.getVocabsByTopicId);


router.post('/ai/gen', protect, authorizeRoles(['admin', 'staff']), vocabController.genVocabsByAIAssistant);
module.exports = router;
