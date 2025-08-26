// scripts/clearNotifications.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  try {
    const res = await prisma.notification.deleteMany({});
    console.log("✅ Deleted notifications:", res.count);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
