// src/services/topic.service.js
const prisma = require('../../lib/prisma');
const { calculateUserRoadmapProgress } = require('../utils/roadmap.utils');
const { TopicStatus } = require('@prisma/client')

exports.createTopic = async ({ roadmapId, title, description }) => {
  return await prisma.topic.create({
    data: { roadmapId, title, description, status: TopicStatus.INIT },
  });
};

exports.completeTopic = async (userId, topicId) => {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true, roadmapId: true },
  });

  if (!topic) {
    throw new Error('Topic not found.');
  }

  const progress = await prisma.userTopicProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId,
      topicId,
      roadmapId: topic.roadmapId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  const updatedProgressPercentage = await calculateUserRoadmapProgress(userId, topic.roadmapId);

  return {
    message: 'Topic marked as completed.',
    topicProgress: progress,
    roadmapId: topic.roadmapId,
    updatedRoadmapProgressPercentage: updatedProgressPercentage,
  };
};


exports.getTopicById = async (topicId) => {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      roadmap: true,
    },
  });

  if (!topic) {
    throw new Error('Topic not found.');
  }

  return topic;
}

exports.getByRoadMapId = async (roadmapId, paggingRequest) => {
  const topics = await prisma.topic.findMany({
    where: { roadmapId },
    include: {
      roadmap: true,
    },
  });

  if (!topics || topics.length === 0) {
    throw new Error('No topics found for this roadmap.');
  }

  return topics;
}

exports.updateTopic = async (topicId, data) => {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      roadmap: true,
    },
  });

  if (!topic) {
    throw new Error('Topic not found.');
  }
  return await prisma.topic.update({
    where: { id: topicId },
    data: {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      coverImage: data.coverImage ?? undefined,
      is_deleted: data.is_deleted ?? undefined,
      deleted_at: data.deleted_at ?? undefined,
      suggestionLevel: data.suggestionLevel ?? undefined,
      status: TopicStatus.SETTUPED
    },
  });
}