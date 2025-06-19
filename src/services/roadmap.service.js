// src/services/roadmap.service.js
const prisma = require('../../lib/prisma');
const { calculateUserRoadmapProgress, getUserBookmarkStatus } = require('../utils/roadmap.utils');

exports.createRoadmap = async (data) => {
  const { name, categoryId, type, isNew } = data;
  if (!name || !categoryId || !type) {
    throw new Error('Missing required fields: name, categoryId, or type');
  }
  return await prisma.roadmap.create({
    data: {
      name,
      categoryId,
      type,
      isNew: isNew || false,
    },
  });
};

exports.getAllRoadmaps = async (userId) => {
  const roadmaps = await prisma.roadmap.findMany({
    where: { is_deleted: false },
  });

  return await Promise.all(
    roadmaps.map(async (roadmap) => {
      const progressPercentage = userId
        ? await calculateUserRoadmapProgress(userId, roadmap.id)
        : 0;
      const isBookmarked = userId
        ? await getUserBookmarkStatus(userId, roadmap.id)
        : false;
      return { ...roadmap, progressPercentage, isBookmarked };
    })
  );
};

exports.getRoadmapById = async (id, userId) => {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id, is_deleted: false },
  });

  if (!roadmap) return null;

  const progressPercentage = userId
    ? await calculateUserRoadmapProgress(userId, roadmap.id)
    : 0;
  const isBookmarked = userId
    ? await getUserBookmarkStatus(userId, roadmap.id)
    : false;

  return { ...roadmap, progressPercentage, isBookmarked };
};

exports.updateRoadmap = async (id, data) => {
  return await prisma.roadmap.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      categoryId: data.categoryId ?? undefined,
      type: data.type ?? undefined,
      is_deleted: data.is_deleted ?? undefined,
      deleted_at: data.deleted_at ?? undefined,
      isNew: data.isNew ?? undefined,
    },
  });
};

exports.softDeleteRoadmap = async (id) => {
  return await prisma.roadmap.update({
    where: { id },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    },
  });
};
