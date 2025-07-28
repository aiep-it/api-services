
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const wordspaceController = require('../controllers/wordspace.controller');

router.use(protect);

router.get('/', wordspaceController.getWordSpace);
router.post('/topics', wordspaceController.addTopic);
router.post('/topics/:topicId/vocabs', wordspaceController.addVocab);

module.exports = router;
