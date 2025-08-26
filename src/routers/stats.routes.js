// src/routers/stats.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/stats.controller");

// Nếu cần, mở khóa cho Admin dashboard:
// const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
// router.use(authMiddleware, requireAdmin);

router.get("/students", ctrl.studentStats);
router.get("/teachers", ctrl.teacherStats);
router.get("/classes",  ctrl.classStats);

// NEW
router.get("/users/role-distribution", ctrl.roleDistribution);

module.exports = router;
