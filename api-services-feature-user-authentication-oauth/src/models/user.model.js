const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const usersModel = {
  findAll: async () => {
    return await prisma.users.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
  },

  findById: async (id) => {
    return await prisma.users.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
  },

  create: async (data) => {
    return await prisma.users.create({
      data,
      select: { id: true, name: true, email: true, role: true },
    });
  },

  update: async (id, data) => {
    return await prisma.users.update({
      where: { id },
      data,
    });
  },

  delete: async (id) => {
    return await prisma.users.delete({
      where: { id },
    });
  },
};

module.exports = usersModel;
