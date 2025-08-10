const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to generate a random string of a given length
function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function generateStudentUsername() {
    let username;
    let foundUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10; // Reduce max attempts for faster generation

    while (!foundUnique && attempts < MAX_ATTEMPTS) {
        // Get a short timestamp (last 5 digits of milliseconds)
        const timestampPart = String(Date.now()).slice(-5);
        // Generate a short random suffix
        const randomSuffix = generateRandomString(3); // 3 random characters

        username = `HS${timestampPart}${randomSuffix}`; // e.g., HS12345abc

        try {
            const found = await prisma.user.findUnique({ where: { username } });
            if (!found) {
                foundUnique = true;
            } else {
                console.log(`Username ${username} already exists. Trying a new one.`);
            }
        } catch (dbError) {
            console.error("Error checking username uniqueness:", dbError);
            // If there's a DB error, still try a new username
        }

        attempts++;
        // No need for setTimeout here, as uniqueness is handled by random suffix and retries
    }

    if (!foundUnique) {
        throw new Error("Could not generate a unique username after multiple attempts. Please try again.");
    }

    return username;
}

module.exports = { generateStudentUsername };