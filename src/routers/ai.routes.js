
const express = require('express');
const router = express.Router();
const { generateVocabFromImageHandler } = require('../controllers/ai.controller');
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

module.exports = router;
