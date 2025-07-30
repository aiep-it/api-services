// src/utils/roadmap.utils.js
const prisma = require('../../lib/prisma');

/**
 * Tính phần trăm tiến độ học roadmap của user
 */
exports.calculateUserRoadmapProgress = async (userId, roadmapId) => {
  const totalTopics = await prisma.topic.count({
    where: { roadmapId },
  });

  if (totalTopics === 0) return 0;

  const completedTopics = await prisma.userTopicProgress.count({
    where: {
      userId,
      isCompleted: true,
      topic: {
        roadmapId: roadmapId,
      },
    },
  });

  return (completedTopics / totalTopics) * 100;
};

/**
 * Kiểm tra user đã bookmark roadmap chưa
 */
exports.getUserBookmarkStatus = async (userId, roadmapId) => {
  if (!userId) return false;

  const bookmark = await prisma.UserRoadmap.findUnique({
    where: {
      userId_roadmapId: {
        userId,
        roadmapId,
      },
    },
  });

  return !!bookmark;
};
