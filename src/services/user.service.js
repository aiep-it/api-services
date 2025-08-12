// src/services/user.service.js
const prisma = require("../../lib/prisma");
const { createClerkClient } = require("@clerk/backend");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

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
  const { email, password, first_name, last_name, fullName, username } = userData;

  console.log("Creating Clerk user with data:", {
    ...userData
  });

  const user = await clerkClient.users.createUser({
    emailAddress: email,
    password: password,
    first_name: first_name,
    last_name: last_name,
    username: username,
    publicMetadata: {
      fullName: fullName,
      role: "student",
    },
    skipPasswordChecks: true, // Skip password checks for demo purposes
    
  });
  return user;
};

exports.sendInvite = async (email, role) => {
  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role: role,
      },
      redirectUrl: "https://dxri5rqql2ood.cloudfront.net/"
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
