const express = require('express');
const router = express.Router();
const classController = require('../controllers/class/class.controller');
const { protect } = require('../middleware/authMiddleware');


/**
 * @swagger
 * tags:
 *   name: Class Management
 *   description: API for managing classes
 */

/**
 * @swagger
 * /class/all-my-classes:
 *   get:
 *     summary: Get all classes for the authenticated user
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClassInfoWithRole'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if user is not admin/staff)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/all-my-classes', protect, classController.getClassesByUserId);

/**
 * @swagger
 * /class:
 *   get:
 *     summary: Get all classes
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *         description: Filter classes by teacher ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search classes by name or code
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/', protect, classController.getAllClasses);

/**
 * @swagger
 * /class:
 *   post:
 *     summary: Create a new class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassRequest'
 *     responses:
 *       201:
 *         description: Class created successfully
 *         schema:
 *           $ref: '#/components/schemas/Class'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post('/', protect, classController.createClass);

/**
 * @swagger
 * /class/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class to retrieve
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', protect, classController.getClassById);

/**
 * @swagger
 * /class/{id}:
 *   put:
 *     summary: Update a class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class to update
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/UpdateClassRequest'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         schema:
 *           $ref: '#/components/schemas/Class'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', protect, classController.updateClass);

/**
 * @swagger
 * /class/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class to delete
 *     responses:
 *       204:
 *         description: Class deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', protect, classController.deleteClass);

/**
 * @swagger
 * /class/{id}/add-teacher:
 *   patch:
 *     summary: Add teacher to class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teacherId:
 *               type: string
 *               description: ID of the teacher to add
 *           required:
 *             - teacherId
 *     responses:
 *       200:
 *         description: Teacher added successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class or teacher not found
 *       500:
 *         description: Internal Server Error
 */
router.patch('/:id/add-teacher', protect, classController.addTeacherToClass);

/**
 * @swagger
 * /class/{id}/remove-teacher:
 *   patch:
 *     summary: Remove teacher from class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teacherId:
 *               type: string
 *               description: ID of the teacher to remove
 *           required:
 *             - teacherId
 *     responses:
 *       200:
 *         description: Teacher removed successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class or teacher not found
 *       500:
 *         description: Internal Server Error
 */
router.patch('/:id/remove-teacher', protect, classController.removeTeacherFromClass);

/**
 * @swagger
 * /class/{id}/add-students:
 *   patch:
 *     summary: Add students to class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             studentIds:
 *               type: array
 *               items:
 *                 type: string
 *               description: Array of student IDs to add
 *           required:
 *             - studentIds
 *     responses:
 *       200:
 *         description: Students added successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal Server Error
 */
router.patch('/:id/add-students', protect, classController.addStudentsToClass);

/**
 * @swagger
 * /class/{id}/remove-student/{studentId}:
 *   delete:
 *     summary: Remove student from class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student to remove
 *     responses:
 *       200:
 *         description: Student removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class or student not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id/remove-student/:studentId', protect, classController.removeStudentFromClass);

/**
 * @swagger
 * /class/{id}/remove-roadmap:
 *   patch:
 *     summary: Remove roadmap from class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             roadmapId:
 *               type: string
 *               description: ID of the roadmap to remove
 *           required:
 *             - roadmapId
 *     responses:
 *       200:
 *         description: Roadmap removed successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class or roadmap not found
 *       500:
 *         description: Internal Server Error
 */
router.patch('/:id/remove-roadmap', protect, classController.removeRoadmapFromClass);

/**
 * @swagger
 * /class/{id}/roadmaps:
 *   post:
 *     summary: Add roadmap to class
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             roadmapId:
 *               type: string
 *               description: ID of the roadmap to add
 *           required:
 *             - roadmapId
 *     responses:
 *       200:
 *         description: Roadmap added successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class or roadmap not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/:id/roadmaps', protect, classController.addRoadmapToClass);

/**
 * @swagger
 * /class/my-class-info/{classId}:
 *   get:
 *     summary: Get class information by user ID and class ID
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the class to retrieve information for
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found for this user or classId
 *       500:
 *         description: Internal Server Error
 */
router.get('/my-class-info/:classId', protect, classController.getClassInfoByUserIdAndClassId);

/**
 * @swagger
 * /class/join-by-code:
 *   post:
 *     summary: Join a class using a class code
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classCode:
 *                 type: string
 *                 description: The unique code of the class to join
 *             required:
 *               - classCode
 *     responses:
 *       200:
 *         description: Successfully joined class
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Successfully joined class
 *             data:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 classId:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [STUDENT]
 *       400:
 *         description: Bad Request (e.g., missing class code, class not found, user already in class)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post('/join-by-code', protect, classController.joinClassByCode);

router.get('/gen-code', protect)

/**
 * @swagger
 * /class/gen-code:
 *   get:
 *     summary: Generate a new class code
 *     tags: [Class Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated a new class code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: The newly generated class code
 *                   example: "ABC123XYZ"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

module.exports = router;