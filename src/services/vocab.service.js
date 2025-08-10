// src/services/vocab.service.js
const prisma = require("../../lib/prisma");

const flattenedVocabs = (vocabs) => {
  return vocabs.map((vocab) => {
    return {
      ...vocab,
      is_learned:
        vocab.userVocabProgress && vocab.userVocabProgress.length > 0
          ? vocab.userVocabProgress[0]?.is_learned
          : false,
    };
  });
};
exports.getVocabById = async (id) => {
  const vocab = await prisma.vocab.findUnique({
    where: { id, is_deleted: false },
  });

  if (!vocab) return null;
  return vocab;
};

exports.getAllVocabs = async (
  page = 1,
  size = 10,
  search = "",
  filters = {},
  sortFields = [{ field: "created_at", order: "desc" }]
) => {
  const skip = (page - 1) * size;
  const where = {
    is_deleted: false,
    ...filters,
    ...(search && {
      OR: [
        { word: { contains: search, mode: "insensitive" } },
        { meaning: { contains: search, mode: "insensitive" } },
        { example: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const orderBy = sortFields.map(({ field, order }) => ({
    [field]: order,
  }));
  const [vocabs, totalCount] = await Promise.all([
    prisma.vocab.findMany({
      where,
      skip,
      take: size,
      orderBy: orderBy,
    }),
    prisma.vocab.count({ where }),
  ]);

  return {
    content: vocabs,
    page,
    size,
    totalElements: totalCount,
    totalPages: Math.ceil(totalCount / size),
    first: page === 1,
    last: page >= Math.ceil(totalCount / size),
    empty: vocabs.length === 0,
  };
};

exports.createVocab = async (data) => {
  return prisma.vocab.create({ data });
};

exports.createManyVocabs = async (data) => {
  return prisma.vocab.createMany({ data });
};

exports.updateVocab = async (id, data) => {
  return prisma.vocab.update({
    where: { id },
    data,
  });
};

exports.deleteVocab = async (id) => {
  return prisma.vocab.update({
    where: { id },
    data: { is_deleted: true },
  });
};

exports.getVocabsByTopicId = async (
  topicId,
  page = 1,
  size = 10,
  search = "",
  filters = {},
  sortFields = [{ field: "created_at", order: "desc" }],
  userId = null
) => {
  const skip = (page - 1) * size;
  const where = {
    topicId,
    is_deleted: false,
    ...filters,
    ...(search && {
      OR: [
        { word: { contains: search, mode: "insensitive" } },
        { meaning: { contains: search, mode: "insensitive" } },
        { example: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  const orderBy = sortFields.map(({ field, order }) => ({
    [field]: order,
  }));

  const include = {};
  if (userId) {
    include.userVocabProgress = {
      where: { userId },
      select: { is_learned: true },
    };
  }

  const [vocabs, totalCount] = await Promise.all([
    prisma.vocab.findMany({
      where,
      include,
      skip,
      take: size,
      orderBy: orderBy,
    }),
    prisma.vocab.count({ where }),
  ]);

  // Flatten the is_learned into top level
  const vocabsWithIsLearned = flattenedVocabs(vocabs);

  return {
    content: vocabsWithIsLearned,
    page,
    size,
    totalElements: totalCount,
    totalPages: Math.ceil(totalCount / size),
    first: page === 1,
    last: page >= Math.ceil(totalCount / size),
    empty: vocabs.length === 0,
  };
};

exports.getAllVocabsByTopicId = async (topicId) => {
  const vocabs = await prisma.vocab.findMany({
    where: {
      topicId,
      is_deleted: false,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return vocabs;
};

//TODO enhance vocab in road assigned
exports.getAllMyVocabs = async (userId) => {
  const vocabs = await prisma.vocab.findMany({
    where: {
      is_deleted: false,
    },
    include: {
      userVocabProgress: {
        where: {
          userId: userId,
        },
        select: {
          is_learned: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  // Flatten the is_learned into top level
  const vocabsWithIsLearned = flattenedVocabs(vocabs);

  return {
    content: vocabsWithIsLearned,
    page: 1,
    size: 10000,
    totalElements: vocabs.length,
    totalPages: 1,
    first: 1,
    last: 1,
    empty: vocabs.length === 0,
  };
};

exports.markVocabAsLearned = async (vocabId, userId) => {
  const vocab = await prisma.vocab.findUnique({
    where: { id: vocabId },
    select: { topicId: true },
  });

  if (vocab && vocab.topicId) {
    await prisma.userTopicProgress.upsert({
      where: { userId_topicId: { userId: userId, topicId: vocab.topicId } },
      update: {},
      create: { userId: userId, topicId: vocab.topicId },
    });
  }

  return prisma.userVocabProgress.upsert({
    where: {
      userId_vocabId: {
        userId: userId,
        vocabId: vocabId,
      },
    },
    update: {
      is_learned: true,
    },
    create: {
      userId: userId,
      vocabId: vocabId,
      is_learned: true,
    },
  });
};
