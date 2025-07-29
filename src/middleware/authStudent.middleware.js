// src/middleware/authStudent.middleware.js
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

const JWT_SECRET = process.env.JWT_SECRET ;

const protectStudent = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized student access" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Forbidden: Not student" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token: " + err.message });
  }
};

module.exports = { protectStudent };
