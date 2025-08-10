const prisma = require("../../lib/prisma");
const getPersonalLearningByUserId = async (userId) => {
  return await prisma.personalLearning.findMany({
    where: {
      userId: userId,
    },
    include: {
        vocabs: true,
      },
  });
};

const createPersonalLearning = async (data) => {
  const { vocabs, ...personalLearningData } = data;
  // console.log("Creating personal learning with data:", {
  //   data: {
  //       ...personalLearningData,
  //       vocabs: {
  //         create: [...vocabs],
  //       },
  //     },
  // });
  return await prisma.personalLearning.create({
    data: {
      ...personalLearningData,
      vocabs: {
        create: [...vocabs],
      },
    },
  });
};

const updatePersonalLearning = async (id, data) => {
  return await prisma.personalLearning.update({
    where: {
      id,
    },
    data,
  });
};

const deletePersonalLearning = async (id) => {
  return await prisma.personalLearning.delete({
    where: {
      id,
    },
  });
};

const getPersonalLearningByTopicId = async (topicId) => {
  return await prisma.personalLearning.findMany({
    where: {
      topicId: topicId,
    },
    include: {
      vocabs: true,
    },
  });
};

module.exports = {
  getPersonalLearningByUserId,
  createPersonalLearning,
  updatePersonalLearning,
  deletePersonalLearning,
  getPersonalLearningByTopicId,
};
