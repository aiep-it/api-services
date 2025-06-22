// api-services/routers/webhookRouter.js
const express = require('express');
const router = express.Router();
const { webhookHandler } = require('../controllers/webhook.controller');

router.post('/clerk', webhookHandler);

module.exports = router;