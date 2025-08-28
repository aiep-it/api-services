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
  console.log("Creating personal learning with data:", {
    data: {
        ...personalLearningData,
        vocabs: {
          create: [...vocabs],
        },
      },
  });
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
  const { vocabs, ...personalLearningData } = data;

  // Start a transaction to ensure atomicity
  return await prisma.$transaction(async (prisma) => {
    // 1. Update the PersonalLearning record itself
    const updatedPersonalLearning = await prisma.personalLearning.update({
      where: {
        id,
      },
      data: personalLearningData,
    });

    // 2. Handle vocabs: Delete existing and create new ones
    // This assumes vocabs in the payload are meant to replace existing ones.
    if (vocabs !== undefined) {
      // Delete all existing vocabs for this personal learning entry
      await prisma.vocab.deleteMany({
        where: {
          personalLearningId: id,
        },
      });

      // Create new vocabs
      if (vocabs.length > 0) {
        await prisma.vocab.createMany({
          data: vocabs.map(vocab => ({
            ...vocab,
            personalLearningId: id, // Link to the current personal learning
          })),
        });
      }
    }

    return updatedPersonalLearning;
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
