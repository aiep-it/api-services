const userService = require("../../services/student.service");
const studentService = require("../../services/student.service");
const { parseExcelFile } = require("../../utils/excel.helper");

module.exports = {
  // POST /api/students/create
  async createStudent(req, res) {
    try {
      const result = await userService.createStudent(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // POST /api/students/bulk-import (form-data with file)
async importStudentsExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được tải lên.' });
    }
    const students = await parseExcelFile(req.file.path);
    // console.log('Danh sách học sinh từ file Excel:', students);
    const result = await userService.createMultipleStudents(students);

    res.status(201).json(result);
  } catch (err) {
    console.error("❌ Import failed:", err);
    res.status(400).json({ error: err.message });
  }
},


  // PATCH /api/students/me/change-password (student JWT only)
  async changeMyPassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      const result = await userService.changeOwnPassword(userId, oldPassword, newPassword);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // GET /api/students
  async getAllStudents(req, res) {
    try {
      const keyword = req.query.keyword || "";
      const result = await userService.getAllStudents(keyword);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PATCH /api/students/:id
  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.updateStudent(id, req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // DELETE /api/students/:id
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.deleteStudent(id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async enrollRoadmap(req, res, next) {
    try {
      const { roadmapId } = req.body;
      const userId = req.user.id;

      if (!roadmapId) {
        return res.status(400).json({ message: 'Roadmap ID is required' });
      }

      const enrollment = await studentService.enrollRoadmap(userId, roadmapId);
      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  },
};


exports.enrollRoadmap = async (req, res, next) => {
  try {
    const { roadmapId } = req.body;
    const userId = req.user.id;

    if (!roadmapId) {
      return res.status(400).json({ message: 'Roadmap ID is required' });
    }

    const enrollment = await studentService.enrollRoadmap(userId, roadmapId);
    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
};
