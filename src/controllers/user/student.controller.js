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
    console.log('Danh sách học sinh từ file Excel:', students);
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

  // GET /api/students/activate/:token
  async activateStudent(req, res) {
    const css = `
      body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f4f4f4; }
      .container { background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); text-align: center; }
      h1 { color: #333; }
      p { color: #666; }
      .success { color: #28a745; }
      .error { color: #dc3545; }
    `;
    try {
      const { token } = req.params;
      const username = Buffer.from(token, 'base64').toString('utf8');
      if (!username) {
        return res.status(400).send(`
          <html>
          <head><title>Activation Failed</title><style>${css}</style></head>
          <body>
            <div class="container">
              <h1 class="error">Activation Failed</h1>
              <p>Invalid activation token.</p>
            </div>
          </body>
          </html>
        `);
      }

      const result = await studentService.activateStudent(username);
      res.status(200).send(`
        <html>
        <head><title>Account Activated</title><style>${css}</style></head>
        <body>
          <div class="container">
            <h1 class="success">Account Activated Successfully!</h1>
            <p>Your account has been activated. You can now log in.</p>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      console.error("Error activating student:", err);
      res.status(400).send(`
        <html>
        <head><title>Activation Failed</title><style>${css}</style></head>
        <body>
          <div class="container">
            <h1 class="error">Activation Failed</h1>
            <p>${err.message || "An unexpected error occurred."}</p>
          </div>
        </body>
        </html>
      `);
    }
  },
};
