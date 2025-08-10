const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { generateStudentUsername } = require("../utils/username.helper");
const userService = require("./user.service");

const DEFAULT_PASSWORD = "123456az"; // Default strong password for Clerk
module.exports = {
  async createStudent(payload) {
    const username = await generateStudentUsername();
    const password = DEFAULT_PASSWORD;

    const clerkUserData = {
      password: password,
      first_name: payload.fullName.split(" ")[0], // First part as first name
      last_name: payload.fullName.split(" ").slice(1).join(" "), // Remaining parts as last name
      fullName: payload.fullName,
      username: username,
    };

    try {
      const clerkUser = await userService.createClerkUser(clerkUserData);
      return {
        clerkId: clerkUser.id,
        username: username,
        password: password,
        fullName: payload.fullName,
        message: "Student creation initiated via Clerk. Local sync will follow.",
      };
    } catch (error) {
      console.error("Error creating Clerk user:", error);
      throw new Error("Failed to create student via Clerk.");
    }
  },

async createMultipleStudents(studentList) {
  const createdUsers = [];
  const studentsResult = [];

  for (const s of studentList) {
    const username = await generateStudentUsername();
    const password = DEFAULT_PASSWORD; // Use a strong default password for Clerk

    const clerkUserData = {
      email: s.email,
      password: password,
      firstName: s.fullName.split(" ")[0],
      lastName: s.fullName.split(" ").slice(1).join(" "),
      fullName: s.fullName,
      username: username,
    };

    try {
      const clerkUser = await userService.createClerkUser(clerkUserData);
      createdUsers.push(clerkUser);
      studentsResult.push({
        clerkId: clerkUser.id,
        username: username,
        password: password,
        fullName: s.fullName,
      });
    } catch (error) {
      console.error("❌ Error creating Clerk user for bulk import:", error);
      throw new Error(`Failed to create student ${s.fullName} via Clerk: ${error.message}`);
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
