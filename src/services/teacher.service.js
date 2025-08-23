const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createFeedback = async (teacherId, studentId, classId, content) => {
  try {
    const feedback = await prisma.feedBackStudent.create({
      data: {
        teacherId: teacherId,
        studentId: studentId,
        classId: classId,
        content: content,
      },
    });
    return feedback;
  } catch (error) {
    console.error("Error creating feedback in service:", error);
    throw new Error(`Failed to create feedback: ${error.message}`);
  }
};

exports.getRoadmapsByClassId = async (classId) => {
  // 1. Find the Class by classId to get its level
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { level: true }, // Select only the level
  });

  if (!classData) {
    throw new Error("Class not found.");
  }

  const classLevel = classData.level;

  // 2. Find Category by level as name
  const category = await prisma.category.findUnique({
    where: { name: classLevel }, // Assuming category name matches class level
  });

  if (!category) {
    // If no category matches the class level, return empty array or throw error
    return []; // Or throw new Error(`Category not found for level: ${classLevel}`);
  }

  

  // 3. Get roadmaps already assigned to this class
  const assignedRoadmaps = await prisma.classRoadmap.findMany({
    where: {
      classId: classId,
    },
    select: {
      roadmapId: true,
    },
  });

  const assignedRoadmapIds = assignedRoadmaps.map(ar => ar.roadmapId);

  // 4. Find Roadmaps by categoryId, excluding already assigned ones
  const roadmaps = await prisma.roadmap.findMany({
    where: {
      categoryId: category.id,
      id: {
        notIn: assignedRoadmapIds,
      },
      isWordSpace: false, // Exclude WordSpace roadmaps
    },
    include: {
      category: true, // Include category details if needed
    },
  });

  return roadmaps;
};

exports.addRoadmapToClass = async (classId, roadmapIds) => {
  // 1. Verify Class exists
  const classExists = await prisma.class.findUnique({ where: { id: classId } });
  if (!classExists) {
    throw new Error("Class not found.");
  }

  const results = {
    successful: [],
    failed: [],
  };

  for (const roadmapId of roadmapIds) {
    try {
      // 2. Verify Roadmap exists
      const roadmapExists = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
      if (!roadmapExists) {
        results.failed.push({ roadmapId, reason: "Roadmap not found." });
        continue;
      }

      // 3. Check if already assigned
      const existingAssignment = await prisma.classRoadmap.findUnique({
        where: {
          classId_roadmapId: {
            classId: classId,
            roadmapId: roadmapId,
          },
        },
      });

      if (existingAssignment) {
        results.failed.push({ roadmapId, reason: "Roadmap is already assigned to this class." });
        continue;
      }

      // 4. Create the assignment
      const newAssignment = await prisma.classRoadmap.create({
        data: {
          classId: classId,
          roadmapId: roadmapId,
        },
      });
      results.successful.push(newAssignment);
    } catch (error) {
      results.failed.push({ roadmapId, reason: error.message || "Unknown error." });
    }
  }

  return results;
};
