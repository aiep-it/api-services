// src/utils/roadmap.utils.js
const prisma = require('../../lib/prisma');

/**
 * Tính phần trăm tiến độ học roadmap của user
 */
exports.calculateUserRoadmapProgress = async (userId, roadmapId) => {
  const totalNodes = await prisma.node.count({
    where: { roadmapId },
  });

  if (totalNodes === 0) return 0;

  const completedNodes = await prisma.userNodeProgress.count({
    where: {
      userId,
      nodeId: {
        in: (
          await prisma.node.findMany({
            where: { roadmapId },
            select: { id: true },
          })
        ).map((node) => node.id),
      },
      isCompleted: true,
    },
  });

  return (completedNodes / totalNodes) * 100;
};

/**
 * Kiểm tra user đã bookmark roadmap chưa
 */
exports.getUserBookmarkStatus = async (userId, roadmapId) => {
  if (!userId) return false;

  const bookmark = await prisma.userRoadmapBookmark.findUnique({
    where: {
      userId_roadmapId: {
        userId,
        roadmapId,
      },
    },
  });

  return !!bookmark;
};
