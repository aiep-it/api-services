// src/services/node.service.js
const prisma = require('../../lib/prisma');
const { calculateUserRoadmapProgress } = require('../utils/roadmap.utils');
const { NodeStatus } = require('@prisma/client')

exports.createTopic = async ({ roadmapId, title, description }) => {
  return await prisma.topic.create({
    data: { roadmapId, title, description, status: NodeStatus.INIT },
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

exports.getByRoadMapId = async (roadmapId, paggingRequest) => {
  const nodes = await prisma.node.findMany({
    where: { roadmapId },
    include: {
      roadmap: true,
    },
  });

  if (!nodes || nodes.length === 0) {
    throw new Error('No nodes found for this roadmap.');
  }

  return nodes;
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
      status: NodeStatus.SETTUPED
    },
  });
}