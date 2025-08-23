const express = require("express");
const parentController = require("../controllers/user/parent.controller");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parent
 *   description: Parent specific functionalities
 */

/**
 * @swagger
 * /parent/me/children:
 *   get:
 *     summary: Get all children associated with the current parent user's email
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of children retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student' # Assuming a Student schema exists
 *       401:
 *         description: Unauthorized
 *       500: 
 *         description: Internal Server Error
 */
router.get("/me/children", protect, parentController.getMyChildren);

/**
 * @swagger
 * /parent/feedback/{studentId}:
 *   get:
 *     summary: Get feedback list for a specific student by parent
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the student to retrieve feedback for
 *     responses:
 *       200:
 *         description: List of feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeedBackStudent' # Assuming a FeedBackStudent schema exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if parent does not own the student)
 *       404:
 *         description: Student not found or no feedback available
 *       500:
 *         description: Internal Server Error
 */
router.get("/feedback/:studentId", protect, parentController.getStudentFeedback);

module.exports = router;
