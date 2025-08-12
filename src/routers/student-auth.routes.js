// src/routers/auth/student-auth.routes.js
const express = require("express");
const router = express.Router();
const { studentLogin } = require("../controllers/user/student-auth.controller");

/**
 * @swagger
 * tags:
 *   name: Student Authentication
 *   description: API for student authentication
 */

/**
 * @swagger
 * /student-login:
 *   post:
 *     summary: Student login
 *     tags: [Student Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Student's username
 *                 example: "student_user"
 *               password:
 *                 type: string
 *                 description: Student's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
router.post("/student-login", studentLogin);

module.exports = router;
