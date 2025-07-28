const express = require('express');
const { createExercise, getExercises, getExerciseById, updateExercise, deleteExercise, generateExercisesController } = require('../controllers/exercise.controller');
const router = express.Router();

/**
 * @swagger
 * /exercise:
 *   post:
 *     summary: Create a new exercise
 *     tags: [Exercises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *               - correctAnswer
 *               - difficulty
 *               - topicId
 *               - userId
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of the exercise (e.g., multiple_choice, fill_in_the_blank)
 *                 example: "multiple_choice"
 *               content:
 *                 type: string
 *                 description: The question or prompt for the exercise
 *                 example: "What is the capital of France?"
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Options for multiple-choice or matching exercises
 *                 example: ["Berlin", "Madrid", "Paris", "Rome"]
 *               correctAnswer:
 *                 type: string
 *                 description: The correct answer to the exercise
 *                 example: "Paris"
 *               hint:
 *                 type: string
 *                 description: A hint for the exercise
 *                 example: "It's a city of love."
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level of the exercise
 *                 example: "easy"
 *               topicId:
 *                 type: string
 *                 description: ID of the associated topic
 *                 example: "clg00000000000000000000000"
 *               userId:
 *                 type: string
 *                 description: ID of the user who created the exercise
 *                 example: "user_2g00000000000000000000000"
 *     responses:
 *       201:
 *         description: Exercise created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clg00000000000000000000001"
 *                 type:
 *                   type: string
 *                   example: "multiple_choice"
 *                 content:
 *                   type: string
 *                   example: "What is the capital of France?"
 *                 options:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Berlin", "Madrid", "Paris", "Rome"]
 *                 correctAnswer:
 *                   type: string
 *                   example: "Paris"
 *                 hint:
 *                   type: string
 *                   example: "It's a city of love."
 *                 difficulty:
 *                   type: string
 *                   example: "easy"
 *                 topicId:
 *                   type: string
 *                   example: "clg00000000000000000000000"
 *                 userId:
 *                   type: string
 *                   example: "user_2g00000000000000000000000"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.post('/', createExercise);
/**
 * @swagger
 * /exercise:
 *   get:
 *     summary: Get all exercises
 *     tags: [Exercises]
 *     responses:
 *       200:
 *         description: A list of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "clg00000000000000000000001"
 *                   type:
 *                     type: string
 *                     example: "multiple_choice"
 *                   content:
 *                     type: string
 *                     example: "What is the capital of France?"
 *                   options:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Berlin", "Madrid", "Paris", "Rome"]
 *                   correctAnswer:
 *                     type: string
 *                     example: "Paris"
 *                   hint:
 *                     type: string
 *                     example: "It's a city of love."
 *                   difficulty:
 *                     type: string
 *                     example: "easy"
 *                   topicId:
 *                     type: string
 *                     example: "clg00000000000000000000000"
 *                   userId:
 *                     type: string
 *                     example: "user_2g00000000000000000000000"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/', getExercises);
/**
 * @swagger
 * /exercise/{id}:
 *   get:
 *     summary: Get an exercise by ID
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the exercise to retrieve
 *     responses:
 *       200:
 *         description: Exercise data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clg00000000000000000000001"
 *                 type:
 *                   type: string
 *                   example: "multiple_choice"
 *                 content:
 *                   type: string
 *                   example: "What is the capital of France?"
 *                 options:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Berlin", "Madrid", "Paris", "Rome"]
 *                 correctAnswer:
 *                   type: string
 *                   example: "Paris"
 *                 hint:
 *                   type: string
 *                   example: "It's a city of love."
 *                 difficulty:
 *                   type: string
 *                   example: "easy"
 *                 topicId:
 *                   type: string
 *                   example: "clg00000000000000000000000"
 *                 userId:
 *                   type: string
 *                   example: "user_2g00000000000000000000000"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Exercise not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getExerciseById);
/**
 * @swagger
 * /exercise/{id}:
 *   put:
 *     summary: Update an exercise by ID
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the exercise to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of the exercise (e.g., multiple_choice, fill_in_the_blank)
 *                 example: "multiple_choice"
 *               content:
 *                 type: string
 *                 description: The question or prompt for the exercise
 *                 example: "What is the capital of France?"
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Options for multiple-choice or matching exercises
 *                 example: ["Berlin", "Madrid", "Paris", "Rome"]
 *               correctAnswer:
 *                 type: string
 *                 description: The correct answer to the exercise
 *                 example: "Paris"
 *               hint:
 *                 type: string
 *                 description: A hint for the exercise
 *                 example: "It's a city of love."
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level of the exercise
 *                 example: "easy"
 *               topicId:
 *                 type: string
 *                 description: ID of the associated topic
 *                 example: "clg00000000000000000000000"
 *               userId:
 *                 type: string
 *                 description: ID of the user who created the exercise
 *                 example: "user_2g00000000000000000000000"
 *     responses:
 *       200:
 *         description: Exercise updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clg00000000000000000000001"
 *                 type:
 *                   type: string
 *                   example: "multiple_choice"
 *                 content:
 *                   type: string
 *                   example: "What is the capital of France?"
 *                 options:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Berlin", "Madrid", "Paris", "Rome"]
 *                 correctAnswer:
 *                   type: string
 *                   example: "Paris"
 *                 hint:
 *                   type: string
 *                   example: "It's a city of love."
 *                 difficulty:
 *                   type: string
 *                   example: "easy"
 *                 topicId:
 *                   type: string
 *                   example: "clg00000000000000000000000"
 *                 userId:
 *                   type: string
 *                   example: "user_2g00000000000000000000000"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Exercise not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateExercise);
/**
 * @swagger
 * /exercise/{id}:
 *   delete:
 *     summary: Delete an exercise by ID
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the exercise to delete
 *     responses:
 *       204:
 *         description: Exercise deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteExercise);
/**
 * @swagger
 * /exercise/generate-from-vocab:
 *   post:
 *     summary: Generate exercises from a list of vocabulary words using AI.
 *     tags: [Exercises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vocabList:
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
 *                     is_know:
 *                       type: boolean
 *                 example:
 *                   - word: "Elephant"
 *                     meaning: "A large mammal"
 *                     example: "The elephant is big."
 *                     imageUrl: "http://example.com/elephant.jpg"
 *                     audioUrl: "http://example.com/elephant.mp3"
 *                     is_know: false
 *     responses:
 *       200:
 *         description: Successfully generated exercises.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: "multiple_choice"
 *                   content:
 *                     type: string
 *                     example: "Which of the following is a large plant-eating mammal with a trunk?"
 *                   options:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Lion", "Elephant", "Giraffe", "Tiger"]
 *                   correctAnswer:
 *                     type: string
 *                     example: "Elephant"
 *                   hint:
 *                     type: string
 *                     example: "It's the largest living land animal."
 *                   difficulty:
 *                     type: string
 *                     example: "easy"
 *                   vocabId:
 *                     type: string
 *                     example: "someVocabId123"
 *       400:
 *         description: Invalid request body.
 *       500:
 *         description: Internal server error.
 */
router.post('/generate-from-vocab', generateExercisesController);

module.exports = router;
