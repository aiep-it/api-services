const express = require('express');
const router = express.Router();
const UserExerciseResultController = require('../controllers/user/exercise.result.controller');
const validateRequest = require('../middleware/validateRequest');
const { createUserExerciseResult, updateUserExerciseResult } = require('../validations/user.exercise.result.validation');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: UserExerciseResult
 *   description: User exercise result management
 */

/**
 * @swagger
 * /user-exercise-results:
 *   post:
 *     summary: Create a new user exercise result
 *     tags: [UserExerciseResult]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exerciseId:
 *                 type: string
 *               answer:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: The user exercise result was successfully created
 *       400:
 *         description: Bad request
 */
router.post('/', protect, validateRequest(createUserExerciseResult), UserExerciseResultController.createUserExerciseResult);

/**
 * @swagger
 * /user-exercise-results/{id}:
 *   get:
 *     summary: Get a user exercise result by ID
 *     tags: [UserExerciseResult]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user exercise result ID
 *     responses:
 *       200:
 *         description: The user exercise result
 *       404:
 *         description: User exercise result not found
 */
router.get('/:id', UserExerciseResultController.getUserExerciseResult);

/**
 * @swagger
 * /user-exercise-results/{id}:
 *   put:
 *     summary: Update a user exercise result by ID
 *     tags: [UserExerciseResult]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user exercise result ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The user exercise result was successfully updated
 *       404:
 *         description: User exercise result not found
 */
router.put('/:id', protect, validateRequest(updateUserExerciseResult), UserExerciseResultController.updateUserExerciseResult);

/**
 * @swagger
 * /user-exercise-results/{id}:
 *   delete:
 *     summary: Delete a user exercise result by ID
 *     tags: [UserExerciseResult]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user exercise result ID
 *     responses:
 *       204:
 *         description: The user exercise result was successfully deleted
 *       404:
 *         description: User exercise result not found
 */
router.delete('/:id', UserExerciseResultController.deleteUserExerciseResult);

module.exports = router;
