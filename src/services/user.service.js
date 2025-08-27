// src/services/user.service.js
const prisma = require("../../lib/prisma");
const { createClerkClient } = require("@clerk/backend");
const { USER_STATUS } = require("../constant/enums/index");
const nodemailer = require("nodemailer");
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});



const RECIPIENT_EMAIL = "<RECIPIENT@EMAIL.COM>";

exports.getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });
};
// src/services/user.service.js
exports.getAllTeachers = async () => {
  return await prisma.user.findMany({
    where: {
      role: "teacher",
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      fullName: true,
      createdAt: true,
    },
  });
};

exports.getUserByClerkId = async (id) => {
  return await prisma.user.findUnique({
    where: { clerkId: id },
  });
};

exports.getUserRoleByClerkId = async (clerkId) => {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  return user?.role || null;
};

// exports.getUserMetrics = async (userId) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const learntToday = await prisma.userNodeProgress.count({
//     where: {
//       userId,
//       isCompleted: true,
//       completedAt: { gte: today },
//     },
//   });

//   const projectsFinished = await prisma.userRoadmapBookmark.count({
//     where: { userId },
//   });

//   const streak = 1;

//   return { streak, learntToday, projectsFinished };
// };

exports.updateUserMetadata = async (userId, role) => {
  // 🔍 1. Tìm clerkId từ userId local
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { clerkId: true },
  });

  if (!user || !user.clerkId) {
    throw new Error("Clerk ID not found for this user");
  }

  await clerkClient.users.updateUserMetadata(user.clerkId, {
    publicMetadata: { role },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return { message: "Metadata & role updated successfully" };
};

exports.updateUserMetadataByUserId = async (userId, metadata) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { clerkId: true },
  });

  if (!user || !user.clerkId) {
    throw new Error("Clerk ID not found for this user");
  }

  // const currentMetatadata = await clerkClient.users.getUserMetadata(user.clerkId);
  const userClerk = await clerkClient.users.getUser(user.clerkId);
  const { publicMetadata: currentMetatadata } = userClerk;

  await clerkClient.users.updateUserMetadata(user.clerkId, {
    publicMetadata: { currentMetatadata, ...metadata },
  });

  return { message: "Metadata & role updated successfully" };
};

// src/services/user.service.js
exports.getUsersWithClerkId = async () => {
  return prisma.user.findMany({
    where: {
      clerkId: {
        not: null,
      },
    },
  });
};

exports.createClerkUser = async (userData) => {
  const {
    email,
    password,
    first_name,
    last_name,
    fullName,
    username,
    status,
    role,
  } = userData;

  const user = await clerkClient.users.createUser({
    email_addresses: email,
    password: password,
    first_name: first_name,
    last_name: last_name,
    username: username,
    publicMetadata: {
      fullName: fullName,
      role: role || "student",
      status: status || USER_STATUS.ACTIVATE,
    },
    skipPasswordChecks: true, // Skip password checks for demo purposes
  });
  return user;
};

exports.sendInvite = async (email, role) => {
  try {
    const invitation = await clerkClient.invitations.createInvitation({
      email_address: email,
      publicMetadata: {
        role: role,
      },
      redirectUrl: "https://dxri5rqql2ood.cloudfront.net/",
    });
    return invitation;
  } catch (error) {
    console.error("Error sending Clerk invitation:", error);
    throw new Error(`Failed to send invitation: ${error.message}`);
  }
};

exports.getInvitations = async () => {
  try {
    const invitations = await clerkClient.invitations.getInvitationList();
    return invitations;
  } catch (error) {
    console.error("Error fetching Clerk invitations:", error);
    throw new Error(`Failed to fetch invitations: ${error.message}`);
  }
};

exports.sendEmail = async (email, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testmailsending165@gmail.com",       // Gmail của bạn
        pass: "axgshrkrxxljzogf",          // App Password (không phải mật khẩu Gmail thường)
      },
    });
    let data = await transporter.sendMail({
      from: 'Snap Learning <no-reply@snaplearn.com>', // sender
      to: email,             // receiver
      subject: subject,
      html: body,
    });

    return data;
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

exports.getMyChildrenByParentEmail = async (parentEmail) => {
  return await prisma.user.findMany({
    where: {
      role: "student",
      parentEmail: parentEmail,
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      fullName: true,
      username: true,
      status: true,
      createdAt: true,
      userClasses: {
        select: {
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true,
            },
          },
        },
      },
      _count: {
        select: {
          feedbackReceived: true,
        },
      },
    },
  });
};

exports.getStudentFeedback = async (studentId, parentEmail) => {
  // 1. Verify that the student belongs to this parent
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
      parentEmail: parentEmail,
      role: "student",
    },
  });

  if (!student) {
    throw new Error("Student not found or does not belong to this parent.");
  }

  // 2. Get all feedback for the student
  const feedbackList = await prisma.feedBackStudent.findMany({
    where: {
      studentId: studentId,
    },
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // 3. Group feedback by classId and studentId in application logic
  const groupedFeedback = feedbackList.reduce((acc, feedback) => {
    const classStudentKey = `${feedback.classId}-${feedback.studentId}`;
    if (!acc[classStudentKey]) {
      acc[classStudentKey] = {
        classId: feedback.classId,
        studentId: feedback.studentId,
        classInfo: feedback.class, // Add class information here
        feedbacks: [], // Change to a simple array for feedbacks
      };
    }

    acc[classStudentKey].feedbacks.push({
      id: feedback.id,
      teacherId: feedback.teacherId, // Keep teacherId for reference
      content: feedback.content,
      created_at: feedback.created_at,
      updated_at: feedback.updated_at,
      teacher: feedback.teacher, // Include teacher details
      // No need to include class here again as it's at a higher level
    });
    return acc;
  }, {});

  // Convert the grouped object back to an array
  return Object.values(groupedFeedback);
};

exports.deleteClerkUser = async (clerkId) => {
  try {
    await clerkClient.users.deleteUser(clerkId);
    return { message: `Clerk user ${clerkId} deleted successfully.` };
  } catch (error) {
    console.error(`Error deleting Clerk user ${clerkId}:`, error);
    throw new Error(`Failed to delete Clerk user: ${error.message}`);
  }
};
