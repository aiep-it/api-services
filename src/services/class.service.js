const prisma = require('../../lib/prisma');



exports.getAllClasses = async ({ teacherId, search }) => {
  const where = {};
  if (teacherId) {
    where.teachers = {
      some: {
        teacherId: teacherId,
      },
    };
  }

  
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        code: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      teachers: {
        include: { teacher: true },
      },
      roadmaps: {
        include: { roadmap: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    code: cls.code,
    level: cls.level,
    description: cls.description,
    teachers: cls.teachers.map((t) => ({
      id: t.teacher.id,
      fullName: t.teacher.fullName,
      email: t.teacher.email,
    })),
    roadmaps: cls.roadmaps.map((r) => ({
      id: r.roadmap.id,
      name: r.roadmap.name,
    })),
  }));
};
exports.addRoadmapToClass = async (classId, roadmapId) => {
  try {
    const existing = await prisma.classRoadmap.findUnique({
      where: {
        classId_roadmapId: {
          classId,
          roadmapId,
        },
      },
    });

    if (existing) {
      throw new Error('Roadmap already assigned to this class');
    }

    return await prisma.classRoadmap.create({
      data: {
        classId,
        roadmapId,
      },
    });
  } catch (error) {
    console.error('❌ Error in addRoadmapToClass:', error);
    throw error;
  }
};

exports.createClass = async (data) => {
  const { teacherIds = [], roadmapIds = [], ...classData } = data;

  return await prisma.class.create({
    data: {
      ...classData,
      teachers: {
        create: teacherIds.map((id) => ({ teacherId: id })),
      },
      roadmaps: {
        create: roadmapIds.map((id) => ({ roadmapId: id })),
      },
    },
  });
};

exports.getClassById = async (classId) => {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: true,
      teachers: {
        include: {
          teacher: true,
        },
      },
      roadmaps: {
        include: {
          roadmap: true,
        },
      },
    },
  });

  if (!cls) return null;

  return {
    id: cls.id,
    name: cls.name,
    code: cls.code,
    level: cls.level,
    description: cls.description,
    students: cls.students,
    teachers: cls.teachers.map((t) => ({
      id: t.teacher.id,
      fullName: t.teacher.fullName,
      email: t.teacher.email,
    })),
    roadmaps: cls.roadmaps.map((r) => ({
      id: r.roadmap.id,
      name: r.roadmap.name,
    })),
  };
};



exports.updateClass = async (classId, data) => {
  return await prisma.class.update({
    where: { id: classId },
    data,
  });
};


// services/class.service.js
exports.deleteClass = async (classId) => {

  const classExists = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true },
  });

  if (!classExists) {
    throw new Error(`Class with id ${classId} not found`);
  }

  return await prisma.$transaction([

    prisma.classTeacher.deleteMany({ where: { classId } }),


    prisma.classRoadmap.deleteMany({ where: { classId } }),


    prisma.user.updateMany({
      where: { classId },
      data: { classId: null },
    }),

    prisma.class.delete({
      where: { id: classId },
    }),
  ]);
};



// class.service.js
exports.addTeacherToClass = async (classId, teacherId) => {
  return prisma.classTeacher.create({
    data: {
      classId,
      teacherId,
    },
  });
};

exports.removeTeacherFromClass = async (classId, teacherId) => {
  try {
    await prisma.classTeacher.delete({
      where: {
        teacherId_classId: {
          teacherId,
          classId,
        },
      },
    });
    return true;
  } catch (error) {
    console.error('❌ Error in classService.removeTeacherFromClass:', error);
    return false;
  }
};



exports.addStudentsToClass = async (classId, studentIds) => {
  return prisma.$transaction(
    studentIds.map((id) =>
      prisma.user.update({
        where: { id },
        data: { classId },
      })
    )
  );
};
exports.removeStudentFromClass = async (classId, studentId) => {
  return prisma.user.update({
    where: { id: studentId },
    data: { classId: null },
  });
};
exports.removeRoadmapFromClass = async (classId, roadmapId) => {
  try {
    await prisma.classRoadmap.delete({
      where: {
        classId_roadmapId: {
          classId,
          roadmapId,
        },
      },
    });
    return true;
  } catch (error) {
    console.error('❌ Error in removeRoadmapFromClass:', error);
    return false;
  }
};
