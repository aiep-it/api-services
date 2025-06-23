// api-services/routers/webhookRouter.js
const express = require('express');
const router = express.Router();
const { webhookHandler } = require('../controllers/webhookController');

router.post('/clerk', webhookHandler);

module.exports = router;