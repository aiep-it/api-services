const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function generateClassCode() {
  let code;
  let foundUnique = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 100; // Max attempts to find a unique code

  while (!foundUnique && attempts < MAX_ATTEMPTS) {
    // Generate a random 8-digit number
    code = Math.floor(10000000 + Math.random() * 90000000).toString();

    try {
      const found = await prisma.class.findUnique({ where: { code } });
      if (!found) {
        foundUnique = true;
      } else {
        console.log(`Class code ${code} already exists. Trying a new one.`);
      }
    } catch (dbError) {
      console.error("Error checking class code uniqueness:", dbError);
      // If there's a DB error, still try a new code
    }

    attempts++;
  }

  if (!foundUnique) {
    throw new Error("Could not generate a unique class code after multiple attempts. Please try again.");
  }

  return code;
}

module.exports = { generateClassCode };