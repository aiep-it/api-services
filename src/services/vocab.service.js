// src/services/vocab.service.js
const prisma = require('../../lib/prisma');

exports.getVocabById = async (id) => {
  const vocab = await prisma.vocab.findUnique({
    where: { id, is_deleted: false }
  });

  if (!vocab) return null;
  return vocab;
};

exports.getAllVocabs = async (page = 1, size = 10, search = '', filters = {}, sortFields = [{ field: 'created_at', order: 'desc' }]) => {
    const skip = (page - 1) * size;
    const where = {
        is_deleted: false,
        ...filters,
        ...(search && {
            OR: [
                { word: { contains: search } },
                { meaning: { contains: search } },
                { example: { contains: search } }
            ]
        })
    }
    const orderBy = sortFields.map(({ field, order }) => ({
        [field]: order
    }))
    const [vocabs, totalCount] = await Promise.all([
        prisma.vocab.findMany({
            where,
            skip,
            take: size,
            orderBy: orderBy
        }),
        prisma.vocab.count({ where })
    ])

    return {
        content: vocabs,
        page,
        size,
        totalElements: totalCount,
        totalPages: Math.ceil(totalCount / size),
        first: page === 1,
        last: page >= Math.ceil(totalCount / size),
        empty: vocabs.length === 0
    }
};
 
exports.createVocab = async (data) => {
  return prisma.vocab.create({ data })
}

exports.updateVocab = async (id, data) => {
  return prisma.vocab.update({
    where: { id },
    data
  })
}

exports.deleteVocab = async (id) => {
  return prisma.vocab.update({
    where: { id },
    data: { is_deleted: true }
  })
}