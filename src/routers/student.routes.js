    const express = require("express");
    const router = express.Router();
    const multer = require("multer");
    const upload = multer({ dest: "uploads/" });

    const studentController = require("../controllers/user/student.controller");
    const { protect, authorizeRoles } = require("../../src/middleware/authMiddleware");
    const { protectStudent } = require("../../src/middleware/authStudent.middleware");
    const validateRequest = require('../middleware/validateRequest');
    const { createStudentSchema } = require('../validations/student.validation');

    // Admin APIs
    router.post("/create", protect, authorizeRoles(["admin"]), validateRequest(createStudentSchema), studentController.createStudent);
    router.post("/bulk-import",upload.single("file"), protect, authorizeRoles(["admin"]),   studentController.importStudentsExcel);
    router.get("/", protect, authorizeRoles(["admin"]), studentController.getAllStudents);
    router.patch("/:id", protect, authorizeRoles(["admin"]), studentController.updateStudent);
    router.delete("/:id", protect, authorizeRoles(["admin"]), studentController.deleteStudent);

    // Học sinh đổi mật khẩu → cần dùng middleware riêng cho JWT học sinh
    router.patch("/me/change-password", protectStudent, studentController.changeMyPassword);

    module.exports = router;