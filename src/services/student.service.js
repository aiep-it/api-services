const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { generateStudentUsername } = require("../utils/username.helper");

module.exports = {
  async createStudent(payload) {
    const hashedPassword = await bcrypt.hash(payload.password || "123456", 10);
    const username = await generateStudentUsername();

    return prisma.user.create({
      data: {
        fullName: payload.fullName,
        parentName: payload.parentName,
        parentPhone: payload.parentPhone,
        address: payload.address,
        role: "student",
        username,
        password: hashedPassword,
      },
    });
  },

async  createMultipleStudents(studentList) {
  const createdUsers = [];
  const studentsResult = [];

  for (const s of studentList) {
    const username = await generateStudentUsername();
    const hashedPassword = await bcrypt.hash("123456", 10);

    try {
      const user = await prisma.user.create({
        data: {
          fullName: s.fullName,
          parentName: s.parentName,
          parentPhone: s.parentPhone,
          address: s.address,
          role: "student",
          username,
          password: hashedPassword,
        },
      });

      createdUsers.push(user);
      studentsResult.push({
        username: user.username,
        password: "123456",
      });
    } catch (error) {
      console.error("❌ Lỗi khi tạo học sinh:", error);
      throw new Error("Không thể tạo danh sách học sinh. Vui lòng thử lại.");
    }
  }

  return {
    count: createdUsers.length,
    students: studentsResult,
  };
}

,

  async changeOwnPassword(id, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Old password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({ where: { id }, data: { password: hashed } });
  },

  async getAllStudents(keyword) {
    return prisma.user.findMany({
      where: {
        role: "student",
        OR: [
          {
            fullName: {
              contains: keyword,
        
            }
          },
          {
            username: {
              contains: keyword,
           
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  },

  async updateStudent(id, data) {
    return prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        address: data.address,
      },
    });
  },

  async deleteStudent(id) {
    return prisma.user.delete({ where: { id } });
  },

  async enrollRoadmap(userId, roadmapId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const roadmap = await prisma.roadmap.findUnique({ 
      where: { id: roadmapId },
      include: { topics: true }
    });
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const existingEnrollment = await prisma.UserRoadmap.findUnique({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error("User is already enrolled in this roadmap");
    }

    const enrollment = await prisma.UserRoadmap.create({
      data: {
        userId,
        roadmapId,
      },
    });

    const topicIds = roadmap.topics.map(topic => topic.id);

    const userTopicProgress = topicIds.map(topicId => ({
      userId,
      topicId,
      isCompleted: false,
    }));

    await prisma.userTopicProgress.createMany({
      data: userTopicProgress,
      skipDuplicates: true, 
    });

    return enrollment;
  },
};
