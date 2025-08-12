const prisma = require('../../lib/prisma');

class UserExerciseResultService {
  async createUserExerciseResult(data) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: data.exerciseId },
      select: { topicId: true },
    });

    if (exercise && exercise.topicId) {
      await prisma.userTopicProgress.upsert({
        where: { userId_topicId: { userId: data.userId, topicId: exercise.topicId } },
        update: {},
        create: { userId: data.userId, topicId: exercise.topicId },
      });
    }

    return prisma.userExerciseResult.upsert({
      where: {
        userId_exerciseId: {
          userId: data.userId,
          exerciseId: data.exerciseId,
        },
      },
      update: data,
      create: data,
    });
  }

  async getUserExerciseResult(id) {
    return prisma.userExerciseResult.findUnique({
      where: { id },
    });
  }

  async updateUserExerciseResult(id, data) {
    const existingResult = await prisma.userExerciseResult.findUnique({
      where: { id },
      include: { exercise: true },
    });

    if (existingResult && existingResult.exercise && existingResult.exercise.topicId) {
      await prisma.userTopicProgress.upsert({
        where: { userId_topicId: { userId: existingResult.userId, topicId: existingResult.exercise.topicId } },
        update: {},
        create: { userId: existingResult.userId, topicId: existingResult.exercise.topicId },
      });
    }

    return prisma.userExerciseResult.update({
      where: { id },
      data,
    });
  }

  async deleteUserExerciseResult(id) {
    return prisma.userExerciseResult.delete({
      where: { id },
    });
  }
}

module.exports = new UserExerciseResultService();
