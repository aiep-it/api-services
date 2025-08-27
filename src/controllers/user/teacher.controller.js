const teacherService = require("../../services/teacher.service");

exports.createFeedback = async (req, res) => {
  try {
    const { studentId, classId,  content } = req.body;
    const teacherId = req.user.id; // Assuming req.user is populated by auth middleware

    if (!studentId || !classId) {
      return res.status(400).json({ error: "Missing required fields: studentId, classId, rating." });
    }

    const feedback = await teacherService.createFeedback(teacherId, studentId, classId, content);
    res.status(201).json(feedback);
  } catch (err) {
    console.error("Error creating feedback:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

exports.getRoadmapsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    const roadmaps = await teacherService.getRoadmapsByClassId(classId);
    res.status(200).json(roadmaps);
  } catch (err) {
    console.error('Error fetching roadmaps by class ID:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.addRoadmapToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { roadmapIds } = req.body; // Get roadmapIds from body

    if (!Array.isArray(roadmapIds) || roadmapIds.length === 0) {
      return res.status(400).json({ error: "roadmapIds must be a non-empty array." });
    }

    const result = await teacherService.addRoadmapToClass(classId, roadmapIds);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding roadmap to class:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.getStudentFeedbackByClass = async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    const teacherId = req.user.id; // Assuming req.user is populated by auth middleware

    const feedbackList = await teacherService.getStudentFeedbackByClass(teacherId, studentId, classId);
    res.status(200).json(feedbackList);
  } catch (err) {
    console.error('Error fetching student feedback by class:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
