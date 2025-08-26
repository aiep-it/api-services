// src/controllers/stats.controller.js
const statsService = require("../services/stats.service");

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const allowed = new Set(["7d", "30d", "90d", "365d"]);
const parseRange = (r) => (allowed.has(r) ? r : "30d");
const clampLimit = (v, def = 8, min = 1, max = 50) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def;
};

// optional: cache 30s cho dashboard
const setCache = (res) => res.set("Cache-Control", "public, max-age=30");

exports.studentStats = ah(async (req, res) => {
  const range = parseRange(req.query.range);
  const data = await statsService.getStudentStats({ range });
  setCache(res);
  res.json(data);
});

exports.teacherStats = ah(async (req, res) => {
  const range = parseRange(req.query.range);
  const data = await statsService.getTeacherStats({ range });
  setCache(res);
  res.json(data);
});

exports.classStats = ah(async (req, res) => {
  const range = parseRange(req.query.range);
  const limit = clampLimit(req.query.limit);
  const data = await statsService.getClassStats({ range, limit });
  setCache(res);
  res.json(data);
});

// NEW: phân bố vai trò người dùng (để FE không phải đếm)
exports.roleDistribution = ah(async (req, res) => {
  const { from, to } = req.query;
  const range = parseRange(req.query.range); // dùng range nếu không có from/to
  const data = await statsService.getRoleDistribution({ from, to, range });
  setCache(res);
  res.json(data);
});
async function getDashboardStats({ range = "30d", limit = 8, from, to, include }) {
  const includeSet = new Set(
    typeof include === "string" && include.length > 0 && include !== "all"
      ? include.split(",").map(s => s.trim())
      : ["students", "teachers", "classes", "roles"]
  );

  const wants = (k) => include === "all" || includeSet.has(k);

  const tasks = [];
  const result = {};

  if (wants("students")) {
    tasks.push(
      getStudentStats({ range }).then((data) => (result.students = data))
    );
  }
  if (wants("teachers")) {
    tasks.push(
      getTeacherStats({ range }).then((data) => (result.teachers = data))
    );
  }
  if (wants("classes")) {
    tasks.push(
      getClassStats({ range, limit }).then((data) => (result.classes = data))
    );
  }
  if (wants("roles")) {
    tasks.push(
      getRoleDistribution({ from, to, range }).then((data) => (result.roles = data))
    );
  }

  await Promise.all(tasks);

  return {
    range,
    limit,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    generatedAt: new Date().toISOString(),
    ...result,
  };
}
