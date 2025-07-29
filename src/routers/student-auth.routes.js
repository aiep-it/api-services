// src/routers/auth/student-auth.routes.js
const express = require("express");
const router = express.Router();
const { studentLogin } = require("../controllers/user/student-auth.controller");

router.post("/student-login", studentLogin);

module.exports = router;
