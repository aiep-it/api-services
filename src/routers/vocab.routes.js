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
 * /vocabs/my-vocabs:
 *   get:
 *     summary: Get current user's vocabulary learning progress
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of vocabs with user's learning progress
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-vocabs', protect, vocabController.getMyVocabLearningProgress);

/**
 * @swagger
 * /vocabs/mark-done/{vocabId}:
 *   put:
 *     summary: Mark a vocabulary as learned for the current user
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vocabId
 *         required: true
 *         description: The ID of the vocabulary to mark as learned
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vocabulary marked as learned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vocabulary or UserVocabProgress not found
 *       500:
 *         description: Internal server error
 */
router.put('/mark-done/:vocabId', protect, vocabController.markVocabAsDone);

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
 * /vocabs/bulk:
 *   post:
 *     summary: Insert a list of vocabs
 *     tags: [Vocabs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - topicId
 *                 - word
 *                 - meaning
 *               properties:
 *                 topicId:
 *                   type: string
 *                 word:
 *                   type: string
 *                 meaning:
 *                   type: string
 *                 example:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                 audioUrl:
 *                   type: string
 *                 is_know:
 *                   type: boolean
 *                   default: false
 *     responses:
 *       200:
 *         description: Vocabs inserted successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.post('/bulk', protect, vocabController.createManyVocabs);

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
router.post('/topic/:topicId', protect,  vocabController.getVocabsByTopicId);

/**
 * @swagger
 * /vocabs/topic/{topicId}/all:
 *   get:
 *     summary: Get all vocabs by topic ID (no pagination)
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
 *     responses:
 *       200:
 *         description: A list of all vocabs for the given topic
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/vocabs'
 */
router.get('/topic/:topicId/all', protect, vocabController.getAllVocabsByTopicId);



/**
 * @swagger
 * /vocabs/ai/gen:
 *   post:
 *     summary: Generate vocabularies for a topic using AI
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
 *               - topicId
 *             properties:
 *               topicId:
 *                 type: string
 *                 description: The ID of the topic to generate vocabularies for
 *     responses:
 *       200:
 *         description: Vocabs generated and saved successfully
 *       400:
 *         description: Bad request, such as missing topicId
 *       404:
 *         description: Topic not found
 */
router.post('/ai/gen', protect, vocabController.genVocabsByAIAssistant);



module.exports = router;
