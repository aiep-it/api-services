// src/services/node.service.js
const prisma = require('../../lib/prisma');
const { calculateUserRoadmapProgress } = require('../utils/roadmap.utils');

exports.createNode = async ({ roadmapId, title, description }) => {
  return await prisma.node.create({
    data: { roadmapId, title, description },
  });
};

exports.completeNode = async (userId, nodeId) => {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { id: true, roadmapId: true },
  });

  if (!node) {
    throw new Error('Node not found.');
  }

  const progress = await prisma.userNodeProgress.upsert({
    where: {
      userId_nodeId: {
        userId,
        nodeId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId,
      nodeId,
      roadmapId: node.roadmapId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  const updatedProgressPercentage = await calculateUserRoadmapProgress(userId, node.roadmapId);

  return {
    message: 'Node marked as completed.',
    nodeProgress: progress,
    roadmapId: node.roadmapId,
    updatedRoadmapProgressPercentage: updatedProgressPercentage,
  };
};
