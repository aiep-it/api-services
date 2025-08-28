const express = require("express");
const teacherController = require("../controllers/user/teacher.controller");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teacher
 *   description: Teacher specific functionalities
 */

/**
 * @swagger
 * /teachers/feedback:
 *   post:
 *     summary: Create feedback for a student
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student receiving feedback
 *               classId:
 *                 type: string
 *                 description: ID of the class related to the feedback
 *               rating:
 *                 type: number
 *                 format: int32
 *                 description: Rating for the student (e.g., 1-5)
 *               comment:
 *                 type: string
 *                 description: Detailed feedback comment
 *             required:
 *               - studentId
 *               - classId
 *               - rating
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if user is not a teacher)
 *       500:
 *         description: Internal Server Error
 */
router.post("/feedback", protect,  teacherController.createFeedback);

/**
 * @swagger
 * /teachers/roadmaps/by-class/{classId}:
 *   get:
 *     summary: Get all roadmaps associated with a class's category
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class to retrieve roadmaps for
 *     responses:
 *       200:
 *         description: List of roadmaps retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Roadmap' # Assuming a Roadmap schema exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if user is not a teacher)
 *       404:
 *         description: Class not found or no roadmaps available
 *       500:
 *         description: Internal Server Error
 */
router.get("/roadmaps/by-class/:classId", protect, authorizeRoles(["teacher"]), teacherController.getRoadmapsByClassId);

/**
 * @swagger
 * /teachers/classes/{classId}/roadmaps:
 *   post:
 *     summary: Assign multiple roadmaps to a class
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class to assign roadmaps to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roadmapIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of roadmap IDs to assign
 *             required:
 *               - roadmapIds
 *     responses:
 *       201:
 *         description: Roadmaps assigned to class successfully
 *       400:
 *         description: Bad request (e.g., roadmaps already assigned, invalid IDs)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if user is not a teacher)
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/classes/:classId/roadmaps", protect, teacherController.addRoadmapToClass);

/**
 * @swagger
 * /teachers/feedback/students/{studentId}/classes/{classId}:
 *   get:
 *     summary: Get feedback for a specific student in a specific class by teacher
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the student
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class
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
 *         description: Forbidden (if user is not a teacher or not authorized for this class/student)
 *       404:
 *         description: Student, Class, or Feedback not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/feedback/students/:studentId/classes/:classId", protect, teacherController.getStudentFeedbackByClass);

module.exports = router;
