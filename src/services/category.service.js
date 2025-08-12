// src/services/category.service.js
const prisma = require('../../lib/prisma');

exports.createCategory = async ({ name, type, description, order }) => {
  return await prisma.category.create({
    data: {
      name,
      type,
      description,
      order: order || 0,
    },
  });
};

exports.getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });
};

exports.updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      description: data.description,
      order: data.order,
    },
  });
};

exports.deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id },
  });
};
exports.getCategoryById = async (id) => {
  return prisma.category.findUnique({
    where: { id },
  });
};