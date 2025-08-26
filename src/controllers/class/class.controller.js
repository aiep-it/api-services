const classService = require('../../services/class.service');

exports.getAllClasses = async (req, res) => {
  try {
    const { teacherId, search } = req.query;
    const data = await classService.getAllClasses({ teacherId, search });
    res.json(data);
  } catch (error) {
    console.error('❌ Error in getAllClasses:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addRoadmapToClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const { roadmapId } = req.body;

    if (!roadmapId) {
      return res.status(400).json({ message: 'roadmapId is required' });
    }

    const result = await classService.addRoadmapToClass(classId, roadmapId);
    res.json({ message: 'Roadmap added successfully', data: result });
  } catch (error) {
    console.error('❌ Error in addRoadmapToClass:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};


exports.createClass = async (req, res) => {
  try {
    const result = await classService.createClass(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error in createClass:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classId = req.params.id;
    const result = await classService.getClassById(classId);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in getClassById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const result = await classService.updateClass(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in updateClass:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// controllers/class.controller.js (trích)
exports.deleteClass = async (req, res) => {
  try {
    const { id: classId } = req.params;
    await prisma.$transaction([
      prisma.userClass.deleteMany({ where: { classId } }),
      prisma.classRoadmap.deleteMany({ where: { classId } }),
      prisma.feedBackStudent.deleteMany({ where: { classId } }),
      prisma.class.delete({ where: { id: classId } }),
      // Notification.classId sẽ tự SetNull -> không cần update
    ]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete class" });
  }
};


exports.addTeacherToClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const { teacherId } = req.body;
    const result = await classService.addTeacherToClass(classId, teacherId);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in addTeacherToClass:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.removeTeacherFromClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const { teacherId } = req.body;
    const result = await classService.removeTeacherFromClass(classId, teacherId);
    if (!result) return res.status(400).json({ message: 'Failed to remove teacher' });

    res.json({ message: 'Teacher removed successfully' });
  } catch (error) {
    console.error('❌ Error in removeTeacherFromClass:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.removeRoadmapFromClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const { roadmapId } = req.body;
    const result = await classService.removeRoadmapFromClass(classId, roadmapId);
    if (!result) return res.status(400).json({ message: 'Failed to remove roadmap' });

    res.json({ message: 'Roadmap removed successfully' });
  } catch (error) {
    console.error('❌ Error in removeRoadmapFromClass:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.addStudentsToClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const { studentIds } = req.body; // array of user ids
    const result = await classService.addStudentsToClass(classId, studentIds);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in addStudentsToClass:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.removeStudentFromClass = async (req, res) => {
  try {
    const { id: classId, studentId } = req.params;
    const result = await classService.removeStudentFromClass(classId, studentId);
    res.json({ message: 'Student removed from class' });
  } catch (error) {
    console.error('❌ Error in removeStudentFromClass:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getClassInfoByUserIdAndClassId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { classId } = req.params; // Get classId from params
    const classInfo = await classService.getClassInfoByUserIdAndClassId(userId, classId);
    if (!classInfo) {
      return res.status(404).json({ message: 'Class not found for this user or classId' });
    }
    res.json(classInfo);
  } catch (error) {
    console.error('❌ Error in getClassInfoByUserIdAndClassId:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getClassesByUserId = async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log('Fetching classes for user ID:', userId);
    const classes = await classService.getClassesByUserId(userId);
    res.json(classes);
  } catch (error) {
    console.error('❌ Error in getClassesByUserId:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.joinClassByCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { classCode } = req.body;

    if (!classCode) {
      return res.status(400).json({ message: 'Class code is required' });
    }

    const result = await classService.joinClassByCode(userId, classCode);
    res.status(200).json({ message: 'Successfully joined class', data: result });
  } catch (error) {
    console.error('❌ Error in joinClassByCode:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

exports.genClassCode = async (req, res) => {
};
