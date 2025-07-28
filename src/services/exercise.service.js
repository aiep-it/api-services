const prisma = require('../../lib/prisma');

const createExercise = async (exerciseData) => {
  return prisma.exercise.create({
    data: exerciseData,
  });
};

const getExercises = async () => {
  return prisma.exercise.findMany({
    include: {
      topic: true,
      user: true,
    },
  });
};

const getExerciseById = async (id) => {
  return prisma.exercise.findUnique({
    where: {
      id,
    },
    include: {
      topic: true,
      user: true,
    },
  });
};

const updateExercise = async (id, exerciseData) => {
  return prisma.exercise.update({
    where: {
      id,
    },
    data: exerciseData,
  });
};

const deleteExercise = async (id) => {
  return prisma.exercise.delete({
    where: {
      id,
    },
  });
};

module.exports = {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
};
