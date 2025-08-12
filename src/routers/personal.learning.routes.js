const express = require("express");
const router = express.Router();
const { protectStudent: authStudent } = require("../middleware/authStudent.middleware");
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const validate = require("../middleware/validateRequest");
const personalLearningRequest = require("../validations/personalLearningRequest");
const {
  createPersonalLearningHandler,
  getPersonalLearningByTopicIdHandler,
  getPersonalLearningByUserIdHandler,
  updatePersonalLearningHandler,
  deletePersonalLearningHandler,
} = require("../controllers/personal.learning.controller");
const multer = require("multer");

// const upload = multer();
router.use(protect);

/**
 * @swagger
 * /personal-learning/create:
 *   post:
 *     summary: Create a new personal learning entry
 *     tags: [Personal Learning]
 *     description: Create a new personal learning entry with a title, description, and associated vocabulary. Requires student authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - description
 *               - vocabs
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user associated with this learning entry.
 *               title:
 *                 type: string
 *                 description: The title of the personal learning entry.
 *               description:
 *                 type: string
 *                 description: A detailed description of the personal learning entry.
 *               vocabs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     word:
 *                       type: string
 *                       description: The vocabulary word.
 *                     meaning:
 *                       type: string
 *                       description: The meaning of the vocabulary word.
 *                     example:
 *                       type: string
 *                       description: An example sentence using the vocabulary word.
 *                     imageUrl:
 *                       type: string
 *                       description: URL of an image related to the vocabulary word.
 *                     audioUrl:
 *                       type: string
 *                       description: URL of an audio pronunciation for the vocabulary word.
 *               topicId:
 *                 type: string
 *                 description: The ID of the topic associated with this learning entry. (Optional)
 *     responses:
 *       '201':
 *         description: Personal learning entry created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Personal learning created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     vocabs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           word:
 *                             type: string
 *                           meaning:
 *                             type: string
 *                           example:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                           audioUrl:
 *                             type: string
 *       '400':
 *         description: Missing required fields or invalid request body.
 *       '401':
 *         description: Unauthorized, authentication token missing or invalid.
 *       '500':
 *         description: Internal server error.
 */
router.post(
  "/create",
  // authStudent,
  validate(personalLearningRequest.createPersonalLearningSchema),
  createPersonalLearningHandler
);




/**
 * @swagger
 * /personal-learning/{userId}:
 *   get:
 *     summary: Get personal learning entries by user ID
 *     tags: [Personal Learning]
 *     description: Retrieve all personal learning entries for a specific user. Requires student authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user.
 *     responses:
 *       '200':
 *         description: A list of personal learning entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   vocabs:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         word:
 *                           type: string
 *                         meaning:
 *                           type: string
 *                         example:
 *                           type: string
 *                         imageUrl:
 *                           type: string
 *                         audioUrl:
 *                           type: string
 *       '401':
 *         description: Unauthorized, authentication token missing or invalid.
 *       '404':
 *         description: No personal learning entries found for the user.
 *       '500':
 *         description: Internal server error.
 */
router.get(
  "/:userId",
  // authStudent,
  // validate(personalLearningRequest.getPersonalLearningByUserIdSchema),
  getPersonalLearningByUserIdHandler
);

/**
 * @swagger
 * /personal-learning/topic/{topicId}:
 *   get:
 *     summary: Get personal learning entries by topic ID
 *     tags: [Personal Learning]
 *     description: Retrieve all personal learning entries for a specific topic. Requires student authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the topic.
 *     responses:
 *       '200':
 *         description: A list of personal learning entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   vocabs:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         word:
 *                           type: string
 *                         meaning:
 *                           type: string
 *                         example:
 *                           type: string
 *                         imageUrl:
 *                           type: string
 *                         audioUrl:
 *                           type: string
 *       '401':
 *         description: Unauthorized, authentication token missing or invalid.
 *       '404':
 *         description: No personal learning entries found for the topic.
 *       '500':
 *         description: Internal server error.
 */
router.get(
  "/topic/:topicId",
  // authStudent,
  getPersonalLearningByTopicIdHandler
);

/**
 * @swagger
 * /personal-learning/{userId}:
 *   get:
 *     summary: Get personal learning entries by user ID
 *     tags: [Personal Learning]
 *     description: Retrieve all personal learning entries for a specific user. Requires student authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user.
 *     responses:
 *       '200':
 *         description: A list of personal learning entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   vocabs:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         word:
 *                           type: string
 *                         meaning:
 *                           type: string
 *                         example:
 *                           type: string
 *                         imageUrl:
 *                           type: string
 *                         audioUrl:
 *                           type: string
 *       '401':
 *         description: Unauthorized, authentication token missing or invalid.
 *       '404':
 *         description: No personal learning entries found for the user.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @swagger
 * /personal-learning/{id}:
 *   put:
 *     summary: Update a personal learning entry by ID
 *     tags: [Personal Learning]
 *     description: Update an existing personal learning entry. Requires student authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the personal learning entry to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               learningObjectives:
 *                 type: array
 *                 items:
 *                   type: string
 *               vocabs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     word:
 *                       type: string
 *                     meaning:
 *                       type: string
 *                     example:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     audioUrl:
 *                       type: string
 *               topicId:
 *                 type: string
 *                 description: The ID of the topic associated with this learning entry. (Optional)
 *     responses:
 *       '200':
 *         description: Personal learning entry updated successfully.
 *       '400':
 *         description: Invalid request body.
 *       '401':
 *         description: Unauthorized, authentication token missing or invalid.
 *       '404':
 *         description: Personal learning entry not found.
 *       '500':
 *         description: Internal server error.
 */
router.put(
  "/:id",
  // authStudent,
  validate(personalLearningRequest.updatePersonalLearningSchema),
  updatePersonalLearningHandler
);

/**
 * @swagger
 * /personal-learning/{id}:
 *   delete:
 *     summary: Delete a personal learning entry by ID
 *     tags: [Personal Learning]
 *     description: Delete an existing personal learning entry. Requires student authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the personal learning entry to delete.
 *     responses:
 *       '204':
 *         description: Personal learning entry deleted successfully.
 *       '401':
 *         description: Unauthorized, authentication token missing or invalid.
 *       '404':
 *         description: Personal learning entry not found.
 *       '500':
 *         description: Internal server error.
 */
router.delete(
  "/:id",
  // authStudent,
  validate(personalLearningRequest.deletePersonalLearningSchema),
  deletePersonalLearningHandler
);

module.exports = router;
