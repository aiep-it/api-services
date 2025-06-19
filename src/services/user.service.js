// src/services/user.service.js
const prisma = require('../../lib/prisma');
const { createClerkClient } = require('@clerk/backend');

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

exports.getUserByClerkId = async (id) => {
  return await prisma.user.findUnique({
    where: { clerkId: id },
  });
};

exports.getUserRoleByClerkId = async (clerkId) => {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  return user?.role || null;
};

exports.getUserMetrics = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const learntToday = await prisma.userNodeProgress.count({
    where: {
      userId,
      isCompleted: true,
      completedAt: { gte: today },
    },
  });

  const projectsFinished = await prisma.userRoadmapBookmark.count({
    where: { userId },
  });

  const streak = 1;

  return { streak, learntToday, projectsFinished };
};

exports.updateUserMetadata = async (userId, role) => {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
  return { message: 'Metadata updated' };
};
