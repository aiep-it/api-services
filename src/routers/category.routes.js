/**
 * @module categoryRoutes
 * @description Routes for managing categories in the application.
 * @swagger
 * tags:
 *   name: Categories
 *   description: Operations about categories
 */

const express = require('express');
const router = express.Router();

// Controller
const categoryController = require('../controllers/category/category.controller');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @route GET /
 * @group Categories - Operations about categories
 * @returns {Array.<Category>} 200 - An array of categories
 * @returns {Error}  default - Unexpected error
 * @swagger
 * /categories:
 *   get:
 *     summary: Retrieve a list of categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route POST /
 * @group Categories - Operations about categories
 * @param {Category.model} category.body.required - category object
 * @returns {Category.model} 201 - Created category
 * @returns {Error}  default - Unexpected error
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: The created category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.post('/', protect, authorizeRoles(['admin', 'staff']), categoryController.createCategory);

/**
 * @route PUT /:id
 * @group Categories - Operations about categories
 * @param {string} id.path.required - category id
 * @param {Category.model} category.body.required - category object
 * @returns {Category.model} 200 - Updated category
 * @returns {Error}  default - Unexpected error
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: The updated category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.put('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.updateCategory);

/**
 * @route DELETE /:id
 * @group Categories - Operations about categories
 * @param {string} id.path.required - category id
 * @returns {string} 200 - Success message
 * @returns {Error}  default - Unexpected error
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success message
 */
router.delete('/:id', protect, authorizeRoles(['admin', 'staff']), categoryController.deleteCategory);

module.exports = router;