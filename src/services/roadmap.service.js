// src/services/roadmap.service.js
const prisma = require('../../lib/prisma');
const { calculateUserRoadmapProgress, getUserBookmarkStatus } = require('../utils/roadmap.utils');

exports.createRoadmap = async (data) => {
  const { name, categoryId,  isNew } = data;
  if (!name || !categoryId) {
    throw new Error('Missing required fields: name, categoryId, or type');
  }
  return await prisma.roadmap.create({
    data: {
      ...data,
      isNew: isNew || false,
    },
  });
};

exports.getAllRoadmaps = async (userId, userRole) => {
  let roadmaps;
  if (userRole?.toLowerCase() === 'student') {
    const userClasses = await prisma.userClass.findMany({
      where: {
        userId: userId,
        role: 'STUDENT',
        // is_deleted: false,
      },
      include: {
        class: {
          include: {
            roadmaps: {
              include: {
                roadmap: true,
              },
            },
          },
        },
      },
    });

    const studentRoadmapIds = new Set();
    userClasses.forEach(uc => {
      uc.class.roadmaps.forEach(cr => {
        if (!cr.roadmap.is_deleted && !cr.roadmap.isWordSpace) {
          studentRoadmapIds.add(cr.roadmap.id);
        }
      });
    });

    roadmaps = await prisma.roadmap.findMany({
      where: {
        id: {
          in: Array.from(studentRoadmapIds),
        },
      },
    });

  } else {
    roadmaps = await prisma.roadmap.findMany({
      where: { is_deleted: false, isWordSpace: false },
    });
  }

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
    include: {
      category: true,
    },
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
