    const express = require("express");
    const router = express.Router();
    const multer = require("multer");
    const upload = multer({ dest: "uploads/" });

    const studentController = require("../controllers/user/student.controller");
    const { protect, authorizeRoles } = require("../../src/middleware/authMiddleware");
    const { protectStudent } = require("../../src/middleware/authStudent.middleware");
    const validateRequest = require('../middleware/validateRequest');
    const { createStudentSchema } = require('../validations/student.validation');

    // Admin APIs
    /**
     * @swagger
     * /student/create:
     *   post:
     *     summary: Create a new student
     *     tags: [Student]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateStudentRequest'
     *     responses:
     *       201:
     *         description: Student created successfully
     *         schema:
     *           $ref: '#/components/schemas/CreateStudentResponse'
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.post("/create", protect, authorizeRoles(["admin"]), validateRequest(createStudentSchema), studentController.createStudent);

    /**
     * @swagger
     * /student/bulk-import:
     *   post:
     *     summary: Import students from an Excel file
     *     tags: [Student]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *     responses:
     *       201:
     *         description: Students imported successfully
     *         schema:
     *           $ref: '#/components/schemas/BulkImportStudentsResponse'
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.post("/bulk-import",upload.single("file"), protect, authorizeRoles(["admin"]),   studentController.importStudentsExcel);

    /**
     * @swagger
     * /student/activate/{token}:
     *   get:
     *     summary: Activate a student account via base64 encoded token
     *     tags: [Student]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Base64 encoded token containing student activation information
     *     responses:
     *       200:
     *         description: Student activated successfully
     *       400:
     *         description: Invalid or expired token
     *       500:
     *         description: Server error
     */
    router.get("/activate/:token", studentController.activateStudent);

    /**
     * @swagger
     * /student:
     *   get:
     *     summary: Get all students
     *     tags: [Student]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: keyword
     *         schema:
     *           type: string
     *         description: Keyword to search for
     *     responses:
     *       200:
     *         description: A list of students
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Student'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get("/", protect, authorizeRoles(["admin"]), studentController.getAllStudents);

    /**
     * @swagger
     * /student/{id}:
     *   patch:
     *     summary: Update a student
     *     tags: [Student]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/StudentUpdate'
     *     responses:
     *       200:
     *         description: Student updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Student'
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.patch("/:id", protect, authorizeRoles(["admin"]), studentController.updateStudent);

    /**
     * @swagger
     * /student/{id}:
     *   delete:
     *     summary: Delete a student
     *     tags: [Student]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Student deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Student deleted successfully"
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.delete("/:id", protect, authorizeRoles(["admin"]), studentController.deleteStudent);

    // Học sinh đổi mật khẩu → cần dùng middleware riêng cho JWT học sinh
    /**
     * @swagger
     * /student/me/change-password:
     *   patch:
     *     summary: Change student's own password
     *     tags: [Student]
     *     security:
     *       - studentBearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               oldPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password changed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Password changed successfully"
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.patch("/me/change-password", protectStudent, studentController.changeMyPassword);

    /**
     * @swagger
     * /student/enroll:
     *   post:
     *     summary: Enroll a student in a roadmap
     *     tags: [Student]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               roadmapId:
     *                 type: string
     *     responses:
     *       201:
     *         description: Enrolled successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Enrolled successfully"
     *                 userRoadmap:
     *                   type: object
     *                   properties:
     *                     userId:
     *                       type: string
     *                     roadmapId:
     *                       type: string
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post("/enroll", protect, studentController.enrollRoadmap);

    module.exports = router;