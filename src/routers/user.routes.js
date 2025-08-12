const express = require('express');
const userController = require('../controllers/user/user.controller');
const meController = require('../controllers/user/me.controller');
const metadataController = require('../controllers/user/metadata.controller');
const bookmarkController = require('../controllers/roadmap/bookmark.controller');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Controllers

// Middleware

// ===== ROUTES =====


/**
 * @swagger
 * /users/invite:
 *   post:
 *     summary: Send an invitation to a new user via Clerk
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user to invite
 *               role:
 *                 type: string
 *                 enum: [admin, staff, student, teacher]
 *                 description: The role to assign to the invited user
 *             required:
 *               - email
 *               - role
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Invitation sent successfully
 *             invitationId:
 *               type: string
 *               description: The ID of the Clerk invitation
 *       400:
 *         description: Bad Request (e.g., missing email or role)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if user is not admin/staff)
 *       500:
 *         description: Internal Server Error
 */
router.post('/invite', protect, authorizeRoles(['admin', 'staff']), userController.sendInvite);


/**
 * @swagger
 * /update-metadata:
 *   post:
 *     summary: Update user metadata
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metadata updated successfully
 *       403:
 *         description: Forbidden
 */
router.post('/update-metadata', protect, authorizeRoles(['admin']), metadataController.updateUserMetadata);

// 2. Lấy role hiện tại (Clerk ID)
/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user role
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user role retrieved successfully
 */
router.get('/me', protect, meController.getCurrentUserRole);

// 3. Lấy metrics người dùng hiện tại
/**
 * @swagger
 * /me/metrics:
 *   get:
 *     summary: Get current user metrics
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User metrics retrieved successfully
 */
router.get('/me/metrics', protect, meController.getUserMetrics);

// 4. Lấy roadmap đã bookmark (learning-roadmaps)
/**
 * @swagger
 * /me/learning-roadmaps:
 *   get:
 *     summary: Get bookmarked learning roadmaps
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarked learning roadmaps
 */
router.get('/me/learning-roadmaps', protect, userController.getLearningRoadmaps);

// 5. Toggle bookmark roadmap
/**
 * @swagger
 * /{roadmapId}/bookmark:
 *   post:
 *     summary: Toggle bookmark for a roadmap
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roadmapId
 *         in: path
 *         required: true
 *         description: ID of the roadmap to bookmark/unbookmark
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully
 */
router.post('/:roadmapId/bookmark', protect, bookmarkController.toggleBookmarkRoadmap);

// 6. Admin: Lấy toàn bộ user
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Forbidden
 */
router.get('/', protect, authorizeRoles(['admin']), userController.getAllUsers);

/**
 * @swagger
 * /users/with-clerk-id:
 *   get:
 *     summary: Get all users with Clerk ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users who have Clerk ID
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: User's internal ID
 *                   clerkId:
 *                     type: string
 *                     description: User's Clerk ID
 *                   email:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   role:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch users
 */

router.get('/with-clerk-id', userController.getAllUsersWithClerkId);
router.get('/teachers', userController.getAllTeachers); 
// 7. Admin: Lấy user theo Clerk ID
/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get user by Clerk ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Clerk ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       403:
 *         description: Forbidden
 */
// <<<<<<< HEAD

// router.get('/:id', protect, authorizeRoles(['admin']), userController.getUserByClerkId);
// =======
router.get('/:id', protect,  userController.getUserByClerkId);

/**
 * @swagger
 * /users/invitations:
 *   get:
 *     summary: Get a list of pending invitations from Clerk
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of invitations retrieved successfully
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Invitation ID
 *               email_address:
 *                 type: string
 *                 format: email
 *                 description: Email address of the invited user
 *               status:
 *                 type: string
 *                 description: Status of the invitation (e.g., pending, accepted)
 *               created_at:
 *                 type: integer
 *                 description: Unix timestamp of creation
 *               public_metadata:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     description: Role assigned to the invited user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if user is not admin/staff)
 *       500:
 *         description: Internal Server Error
 */
router.get('/invitations', protect, authorizeRoles(['admin', 'staff']), userController.getInvitations);

module.exports = router;
