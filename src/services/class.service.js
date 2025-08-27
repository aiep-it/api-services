const prisma = require("../../lib/prisma");
const { generateClassCode } = require("../utils/class.helper");
const { notifyTeacherAdded, notifyAddedToClass } = require("./notification.service");

exports.getAllClasses = async ({ teacherId, search }) => {
  const where = {};
  if (teacherId) {
    where.userClasses = {
      some: {
        userId: teacherId,
        role: 'TEACHER',
      },
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
      {
        code: {
          contains: search,
        },
      },
    ];
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      userClasses: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      roadmaps: {
        include: { roadmap: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return classes.map((cls) => {
    const teachers = cls.userClasses
      .filter(uc => uc.role === 'TEACHER')
      .map(uc => ({
        id: uc.user.id,
        fullName: uc.user.fullName,
        email: uc.user.email,
      }));

    const students = cls.userClasses
      .filter(uc => uc.role === 'STUDENT')
      .map(uc => ({
        id: uc.user.id,
        fullName: uc.user.fullName,
        email: uc.user.email,
      }));

    return {
      id: cls.id,
      name: cls.name,
      code: cls.code,
      level: cls.level,
      description: cls.description,
      teachers: teachers,
      students: students,
      roadmaps: cls.roadmaps.map((r) => ({
        id: r.roadmap.id,
        name: r.roadmap.name,
      })),
    };
  });
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
      throw new Error("Roadmap already assigned to this class");
    }

    return await prisma.classRoadmap.create({
      data: {
        classId,
        roadmapId,
      },
    });
  } catch (error) {
    console.error("❌ Error in addRoadmapToClass:", error);
    throw error;
  }
};

exports.createClass = async (data) => {
  const { teacherIds = [], roadmapIds = [], ...classData } = data;

  const generatedCode = await generateClassCode(); // Generate unique code

  return await prisma.class.create({
    data: {
      ...classData,
      code: generatedCode, // Add the generated code
      userClasses: {
        create: teacherIds.map((id) => ({
          userId: id,
          role: 'TEACHER',
        })),
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
      userClasses: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
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

  const teachers = cls.userClasses
    .filter(uc => uc.role === 'TEACHER')
    .map(uc => ({
      id: uc.user.id,
      fullName: uc.user.fullName,
      email: uc.user.email,
    }));

  const students = cls.userClasses
    .filter(uc => uc.role === 'STUDENT')
    .map(uc => ({
      id: uc.user.id,
      fullName: uc.user.fullName,
      email: uc.user.email,
    }));

  return {
    id: cls.id,
    name: cls.name,
    code: cls.code,
    level: cls.level,
    description: cls.description,
    students: students,
    teachers: teachers,
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

  const exists = await prisma.class.findUnique({ where: { id: classId }, select: { id: true } });
  if (!exists) throw new NotFoundError(`Class with id ${classId} not found`);


  const result = await prisma.$transaction(async (tx) => {
    const delUC = await tx.userClass.deleteMany({ where: { classId } });
    const delCR = await tx.classRoadmap.deleteMany({ where: { classId } });
    const delFB = await tx.feedBackStudent?.deleteMany
      ? await tx.feedBackStudent.deleteMany({ where: { classId } })
      : { count: 0 }; // nếu chưa có bảng feedback

    const delClass = await tx.class.deleteMany({ where: { id: classId } }); // tránh P2025

    return {
      userClasses: delUC.count,
      classRoadmaps: delCR.count,
      feedbacks: delFB.count,
      classes: delClass.count,    
    };
  });

  if (!result.classes) throw new NotFoundError(`Class with id ${classId} not found at delete step`);

  return result;
};


exports.addTeacherToClass = async (classId, teacherId) => {
  const uc = await prisma.userClass.create({ data: { classId, userId: teacherId, role: "TEACHER" } });

  const cls = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true } });
  if (!cls) return uc;

  notifyTeacherAdded({
    teacherUserId: teacherId,
    classId: cls.id,
    className: cls.name,
    classLink: process.env.APP_URL ? `${process.env.APP_URL}/class-room/${cls.id}` : null,
  }).catch((e) => console.error("Notify teacher failed:", e));

  return uc;
};

exports.removeTeacherFromClass = async (classId, teacherId) => {
  try {
    await prisma.userClass.delete({
      where: {
        userId_classId: {
          userId: teacherId,
          classId: classId,
        },
      },
    });
    return true;
  } catch (error) {
    console.error("❌ Error in classService.removeTeacherFromClass:", error);
    return false;
  }
};

exports.addStudentsToClass = async (classId, studentIds) => {
  const result = await prisma.$transaction(
    studentIds.map((id) => prisma.userClass.create({ data: { classId, userId: id, role: "STUDENT" } }))
  );

  const cls = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true } });
  if (!cls) return result;

  Promise.allSettled(
    studentIds.map((sid) =>
      notifyAddedToClass({
        userId: sid,
        classId: cls.id,
        className: cls.name,
        classLink: process.env.APP_URL ? `${process.env.APP_URL}/class-room/${cls.id}` : null,
      })
    )
  ).catch((e) => console.error("Notify students failed:", e));

  return result;
};


exports.removeStudentFromClass = async (classId, studentId) => {
  return prisma.userClass.delete({
    where: {
      userId_classId: {
        userId: studentId,
        classId: classId,
      },
    },
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
    console.error("❌ Error in removeRoadmapFromClass:", error);
    return false;
  }
};

exports.getClassInfoByUserIdAndClassId = async (userId, classId) => {
  const userClassEntry = await prisma.userClass.findUnique({
    where: {
      userId_classId: {
        userId: userId,
        classId: classId,
      },
    },
    include: {
      class: {
        include: {
          userClasses: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  parentName: true,
                  username: true,
                  parentEmail: true,
                },
              },
            },
          },
          roadmaps: {
            include: {
              roadmap: {
                include: {
                  topics: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userClassEntry || !userClassEntry.class) return null;

  const cls = userClassEntry.class;

  const teachers = cls.userClasses
    .filter(uc => uc.role === 'TEACHER')
    .map(uc => ({
      id: uc.user.id,
      fullName: uc.user.fullName,
      email: uc.user.email,
    }));

  const students = cls.userClasses
    .filter(uc => uc.role === 'STUDENT')
    .map(uc => ({
      id: uc.user.id,
      fullName: uc.user.fullName,
      email: uc.user.email,
      parentName: uc.user.parentName,
      username: uc.user.username,
      parentEmail: uc.user.parentEmail,
    }));

  return {
    id: cls.id,
    name: cls.name,
    code: cls.code,
    level: cls.level,
    description: cls.description,
    teachers: teachers,
    roadmaps: await Promise.all(
      cls.roadmaps.map(async (r) => {
        const topicsWithProgress = await Promise.all(
          r.roadmap.topics.map(async (topic) => {
            const totalVocabsInTopic = await prisma.vocab.count({
              where: {
                topicId: topic.id,
              },
            });

            const learnedVocabsInTopic = await prisma.userVocabProgress.count({
              where: {
                userId: userId,
                vocab: {
                  topicId: topic.id,
                },
                is_learned: true,
              },
            });

            return {
              id: topic.id,
              title: topic.title,
              image: topic.coverImage,
              description: topic.description,
              progress: {
                totalVocabs: totalVocabsInTopic,
                learnedVocabs: learnedVocabsInTopic,
              },
            };
          })
        );

        return {
          id: r.roadmap.id,
          name: r.roadmap.name,
          category: r.roadmap.category?.name,
          topics: topicsWithProgress,
        };
      })
    ),
    students: students,
  };
};

exports.getClassesByUserId = async (userId) => {
  console.log("Fetching classes for user:", userId);
  const userClasses = await prisma.userClass.findMany({
    where: { userId: userId },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          level: true,
        },
      },
    },
  });

  return userClasses.map((uc) => ({
    id: uc.class.id,
    name: uc.class.name,
    code: uc.class.code,
    level: uc.class.level,
    description: uc.class.description,
    role: uc.role,
  }));
};

exports.joinClassByCode = async (userId, classCode) => {

  const cls = await prisma.class.findUnique({
    where: { code: classCode },
    select: { id: true, name: true },
  });

  if (!cls) {
    throw new Error("Class not found with the provided code.");
  }

  const existingUserClass = await prisma.userClass.findUnique({
    where: {
      userId_classId: {
        userId: userId,
        classId: cls.id,
      },
    },
  });

  if (existingUserClass) {
    throw new Error("User is already a member of this class.");
  }

  const created = await prisma.userClass.create({
    data: {
      userId,
      classId: cls.id,
      role: 'STUDENT',
    },
  });

  

  notifyAddedToClass({
    userId,                
    classId: cls.id,
    className: cls.name,
    classLink: `${process.env.APP_URL}/classes/${cls.id}`,  
    // realtimeTrigger: (ch, ev, data) => pusherServer.trigger(ch, ev, data), 
  }).catch((e) => console.error('Notify student (join by code) failed:', e));

  return created;
};


exports.genClassCode = async (req, res) => {
};

