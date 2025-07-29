const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function generateStudentUsername() {
    let username;
    let nextNumber;
    let foundUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    try {
        const latestUser = await prisma.user.findFirst({
            where: {
                username: {
                    startsWith: 'HS'
                }
            },
            orderBy: {
                username: 'desc'
            },
            select: {
                username: true
            }
        });

        if (latestUser && latestUser.username) {
            const numPart = parseInt(latestUser.username.substring(2), 10);
            nextNumber = isNaN(numPart) ? 1 : numPart + 1;
        } else {
            nextNumber = 1;
        }
    } catch (error) {
        console.error("Lỗi khi lấy username mới nhất:", error);
        nextNumber = 1;
    }

    while (!foundUnique && attempts < MAX_ATTEMPTS) {
        username = `HS${String(nextNumber).padStart(4, "0")}`;

        try {
            const found = await prisma.user.findUnique({ where: { username } });
            if (!found) {
                foundUnique = true;
            } else {
                console.log(`Username ${username} đã tồn tại. Thử với số tiếp theo.`);
                nextNumber++;
            }
        } catch (dbError) {
            console.error("Lỗi khi kiểm tra username:", dbError);
            nextNumber++;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10)); // Tránh quá tải cơ sở dữ liệu
    }

    if (!foundUnique) {
        throw new Error("Không thể tạo username duy nhất sau nhiều lần thử. Vui lòng thử lại.");
    }

    return username;
}

module.exports = { generateStudentUsername };