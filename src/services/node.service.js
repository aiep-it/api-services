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


exports.getNodeById = async (nodeId) => {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    include: {
      roadmap: true,
    },
  });

  if (!node) {
    throw new Error('Node not found.');
  }

  return node;
}

exports.updateNode = async (nodeId, data) => {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    include: {
      roadmap: true,
    },
  });

  if (!node) {
    throw new Error('Node not found.');
  }
  return await prisma.node.update({
    where: { id: nodeId },
    data: {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      coverImage: data.coverImage ?? undefined,
      is_deleted: data.is_deleted ?? undefined,
      deleted_at: data.deleted_at ?? undefined,
      suggestionLevel: data.suggestionLevel ?? undefined,
    },
  });
}