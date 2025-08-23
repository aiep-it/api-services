const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { generateStudentUsername } = require("../utils/username.helper");
const userService = require("./user.service");
const mailTemplate = require("../config/mail_template");
const { USER_STATUS } = require("../constant/enums/index");
const { createClerkClient } = require("@clerk/backend");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const DEFAULT_PASSWORD = "123456az"; // Default strong password for Clerk
module.exports = {
  async createParentAccount(payload) {
    const { email, fullName } = payload;

    const currentUser = await prisma.user.findUnique({
      where: { email: email },
    });
    await prisma.user.upsert({
      where: { email: email },
      create: {
        fullName: fullName,
        role: "parent",
      },
      update: {
        fullName: fullName,
        role: "parent",
      },
    });

    if (currentUser && currentUser.clerkId) {
    
      await clerkClient.users.updateUserMetadata(currentUser.clerkId, {
        publicMetadata: {
          fullName: fullName,
          role: "parent",
        },
      });
    } else {
      await clerkClient.users.createUser({
        email_addresses: email,
        first_name: fullName,
        last_name: fullName,
        username: `${Date.now()}_parent`,
        password: DEFAULT_PASSWORD,
        publicMetadata: {
          fullName: fullName,
          role: "parent",
        },
        skipPasswordChecks: true, // Skip password checks for initial creation
      });
     
    }
    return {
      message: "Parent account created or updated successfully.",
      email: email,
      fullName: fullName,
    };
  },
  async createStudent(payload) {
    const username = await generateStudentUsername();
    const password = DEFAULT_PASSWORD;

    const clerkUserData = {
      password: password,
      first_name: payload.fullName.split(" ")[0], // First part as first name
      last_name: payload.fullName.split(" ").slice(1).join(" "), // Remaining parts as last name
      fullName: payload.fullName,
      username: username,
      status: USER_STATUS.DEACTIVATE,
    };

    try {
      const clerkUser = await userService.createClerkUser(clerkUserData);

      if (clerkUser) {
        // create parent info
        await prisma.user.upsert({
          where: { username: username }, // Specify the unique identifier for the upsert
          create: {
            clerkId: clerkUser.id,
            username: username,
            password: password,
            fullName: payload.fullName,
            role: "student",
            parentName: payload.parentName,
            parentPhone: payload.parentPhone,
            parentEmail: payload.parentEmail,
            address: payload.address,
            status: USER_STATUS.DEACTIVATE,
          },
          update: {
            clerkId: clerkUser.id,
            fullName: payload.fullName,
            parentName: payload.parentName,
            parentPhone: payload.parentPhone,
            parentEmail: payload.parentEmail,
            address: payload.address,
            status: USER_STATUS.DEACTIVATE,
          },
        });
        // Send email to the parent
        if (payload.parentEmail) {
          console.log("Sending email to parent:", payload.parentEmail);
          const encodedUsername = Buffer.from(username).toString("base64");
          const activationLink = `${process.env.APP_BASE_URL}/api/students/activate/${encodedUsername}`;

          // insert parent account
          this.createParentAccount({
            email: payload.parentEmail,
            fullName: payload.parentName,
          });

          await userService.sendEmail(
            payload.parentEmail,
            "Student Account Activation", // Changed subject for clarity
            mailTemplate(
              payload.parentName,
              activationLink, // Pass activation link
              "https://dxri5rqql2ood.cloudfront.net/sign-in" // Keep sign-in link
              // You might want to pass additional parameters to mailTemplate if it supports a specific activation message
            )
          );
        }
      }
      return {
        clerkId: clerkUser.id,
        username: username,
        password: password,
        fullName: payload.fullName,
        message:
          "Student creation initiated via Clerk. Local sync will follow.",
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
        status: USER_STATUS.DEACTIVATE,
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
        throw new Error(
          `Failed to create student ${s.fullName} via Clerk: ${error.message}`
        );
      }
    }

    return {
      count: createdUsers.length,
      students: studentsResult,
    };
  },

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
            },
          },
          {
            username: {
              contains: keyword,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
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
      include: { topics: true },
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

    const topicIds = roadmap.topics.map((topic) => topic.id);

    const userTopicProgress = topicIds.map((topicId) => ({
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

  async activateStudent(username) {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      throw new Error("Student not found.");
    }

    if (user.status === USER_STATUS.ACTIVATE) {
      throw new Error("Student is already active.");
    }

    const updatedUser = await prisma.user.update({
      where: { username: username },
      data: { status: USER_STATUS.ACTIVATE },
    });

    // Update Clerk metadata
    if (updatedUser.clerkId) {
      await userService.updateUserMetadataByUserId(updatedUser.id, {
        status: USER_STATUS.ACTIVATE,
      });
    }

    return updatedUser;
  },
};
