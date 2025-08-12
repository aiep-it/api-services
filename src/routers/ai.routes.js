
const express = require('express');
const router = express.Router();
const { generateVocabFromImageHandler, generateImageFromPromptHandler, generateQuizHandler } = require('../controllers/ai.controller');
const {generatePersonalLearningFromImageHandler} = require('../controllers/personal.learning.controller');
const multer = require('multer');

const upload = multer();

/**
 * @swagger
 * /generate-vocab-from-image:
 *   post:
 *     summary: Generate vocabulary from an image
 *     tags: [AI]
 *     description: Upload an image to have AI generate a list of vocabulary words related to the image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to extract vocabulary from.
 *     responses:
 *       '200':
 *         description: An array of vocabulary words.
 *       '400':
 *         description: No file uploaded.
 */
router.post(
  '/generate-vocab-from-image',
  upload.single('image'),
  generateVocabFromImageHandler
);

/**
 * @swagger
 * /personal-learning:
 *   post:
 *     summary: Generate a personalized learning plan from an image
 *     tags: [AI]
 *     description: Upload an image to have AI generate a personalized learning plan, including a title, description, learning objectives, and related vocabulary.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to generate the learning plan from.
 *     responses:
 *       '200':
 *         description: A personalized learning plan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Title of the learning plan.
 *                 description:
 *                   type: string
 *                   description: Description of the learning plan.
 *                 learningObjectives:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of learning objectives.
 *                 vocabs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       word:
 *                         type: string
 *                       meaning:
 *                         type: string
 *                       example:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       audioUrl:
 *                         type: string
 *       '400':
 *         description: No file uploaded or invalid request.
 */
router.post(
  '/personal-learning',
  upload.single('image'),
  generatePersonalLearningFromImageHandler
);



/**
 * @swagger
 * /generate-image-from-prompt:
 *   post:
 *     summary: Generate an image from a text prompt
 *     tags: [AI]
 *     description: Send a text prompt to AI to generate an image.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The text prompt for image generation.
 *                 example: "A futuristic city at sunset"
 *     responses:
 *       '200':
 *         description: Successfully generated image.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Generate image successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "generated-image-1678886400000.png"
 *                     path:
 *                       type: string
 *                       example: "./uploads/generated-image-1678886400000.png"
 *       '400':
 *         description: Prompt is required.
 *       '500':
 *         description: Internal server error.
 */
router.post(
  '/generate-image-from-prompt',
  generateImageFromPromptHandler
);

/**
 * @swagger
 * /suggest-quiz:
 *   post:
 *     summary: Generate a quiz question based on a topic and vocabulary
 *     tags: [AI]
 *     description: Generates a single quiz question using AI, based on a provided topic, difficulty, and optional vocabulary list.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicTitle
 *             properties:
 *               topicTitle:
 *                 type: string
 *                 description: The title of the topic for the quiz question.
 *                 example: "Animals"
 *               difficulty:
 *                 type: string
 *                 description: The difficulty level of the quiz question.
 *                 enum: ["beginner", "intermediate", "advanced"]
 *                 default: "beginner"
 *               listVocabs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An optional list of vocabulary words to prioritize in the quiz.
 *                 example: ["cat", "dog", "bird"]
 *               contextContent:
 *                 type: string
 *                 description: Optional additional context for the quiz question.
 *                 example: "Focus on farm animals."
 *     responses:
 *       '200':
 *         description: Successfully generated quiz question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz question generated successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                       correctAnswer:
 *                         type: string
 *                       difficulty:
 *                         type: string
 *                       hint:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *       '400':
 *         description: Missing required parameters.
 *       '500':
 *         description: Internal server error.
 */
router.post(
  '/suggest-quiz',
  generateQuizHandler
);

module.exports = router;
