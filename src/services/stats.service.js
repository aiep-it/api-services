// src/services/stats.service.js
const prisma = require("../../lib/prisma");
const { get } = require("../routers/stats.routes");



// ---------- Helpers ----------
function rangeToWindow(range) {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  if (range === "7d") start.setDate(now.getDate() - 6);
  else if (range === "30d") start.setDate(now.getDate() - 29);
  else if (range === "90d") start.setDate(now.getDate() - 89);
  else if (range === "365d") start.setDate(now.getDate() - 364);
  return { start, end };
}

function makeBuckets(range) {
  // Trả về mảng nhãn gộp theo ngày/tuần/tháng tùy range
  // Đơn giản: 7d/30d => ngày; 90d => tuần; 365d => tháng
  const { start, end } = rangeToWindow(range);
  const labels = [];

  if (range === "7d" || range === "30d") {
    const cur = new Date(start);
    while (cur <= end) {
      labels.push(cur.toISOString().slice(0, 10)); // YYYY-MM-DD
      cur.setDate(cur.getDate() + 1);
    }
  } else if (range === "90d") {
    // 13 tuần
    const weeks = 13;
    for (let i = 0; i < weeks; i++) labels.push(`W${i + 1}`);
  } else if (range === "365d") {
    for (let m = 1; m <= 12; m++) labels.push(`M${m}`);
  }
  return labels;
}

function binByRange(items, range, dateSelector) {
  const labels = makeBuckets(range);
  const result = labels.map((label) => ({ label, value: 0 }));
  if (range === "7d" || range === "30d") {
    const mapIdx = new Map(labels.map((d, i) => [d, i]));
    for (const it of items) {
      const d = new Date(dateSelector(it));
      const iso = d.toISOString().slice(0, 10);
      if (mapIdx.has(iso)) result[mapIdx.get(iso)].value += 1;
    }
  } else if (range === "90d") {
    // Gộp theo tuần đều nhau (đơn giản)
    const { start, end } = rangeToWindow(range);
    const totalDays = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
    const bucketLen = Math.floor(totalDays / 13) || 1;
    for (const it of items) {
      const d = new Date(dateSelector(it));
      const offset = Math.floor((d - start) / 86400000);
      const bucket = Math.min(12, Math.floor(offset / bucketLen));
      result[bucket].value += 1;
    }
  } else if (range === "365d") {
    for (const it of items) {
      const d = new Date(dateSelector(it));
      const m = d.getMonth(); // 0..11
      result[m].value += 1;
    }
  }
  return result;
}

// ---------- Students ----------
async function getStudentStats({ range }) {
  const { start, end } = rangeToWindow(range);

  const [total, activate, deactivate, createdInRange] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "student", status: "ACTIVATE" } }).catch(() => 0),
    prisma.user.count({ where: { role: "student", status: "DEACTIVATE" } }).catch(() => 0),
    prisma.user.findMany({
      where: { role: "student", createdAt: { gte: start, lte: end } },
      select: { id: true, createdAt: true },
    }),
  ]);

  const series = binByRange(createdInRange, range, (x) => x.createdAt);
  return { total, activate, deactivate, series };
}

// ---------- Teachers ----------
async function getTeacherStats({ range }) {
  const { start, end } = rangeToWindow(range);
  const [total, createdInRange] = await Promise.all([
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.user.findMany({
      where: { role: "teacher", createdAt: { gte: start, lte: end } },
      select: { id: true, createdAt: true },
    }),
  ]);

  const series = binByRange(createdInRange, range, (x) => x.createdAt);
  return { total, series };
}

// ---------- Classes ----------
async function getClassStats({ range, limit = 8 }) {
  const { start, end } = rangeToWindow(range);

  // Tổng số lớp
  const total = await prisma.class.count();

  // Lớp tạo trong khoảng -> series cho chart
  const createdInRange = await prisma.class.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { id: true, createdAt: true },
  });
  const series = binByRange(createdInRange, range, (x) => x.createdAt);

  // Lớp gần đây + danh sách teacher + đếm student + đếm roadmaps
  const recentRaw = await prisma.class.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      userClasses: { include: { user: true } }, // chứa cả TEACHER & STUDENT
      roadmaps: true,                            // đúng tên relation từ schema
      // feedbacks, notifications có thể include sau nếu cần
    },
  });

  const recent = recentRaw.map((c) => {
    const teacherNames =
      c.userClasses
        ?.filter((uc) => uc.role === "TEACHER")
        .map((uc) => uc.user?.fullName)
        .filter(Boolean) || [];

    const studentCount =
      c.userClasses?.filter((uc) => uc.role === "STUDENT").length || 0;

    const roadmapCount = Array.isArray(c.roadmaps) ? c.roadmaps.length : 0;

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      level: c.level,
      description: c.description,
      createdAt: c.createdAt,
      teacherNames,
      studentCount,
      roadmapCount,
    };
  });

  return { total, series, recent };
}
const ROLE_LABELS = {
  student: "Học sinh",
  teacher: "Giáo viên",
  admin: "Quản trị",
  staff: "Nhân viên",
  parent: "Phụ huynh",
  anonymus: "Ẩn danh",
  anonymous: "Ẩn danh",
};

async function getRoleDistribution({ from, to, range }) {
  let start, end;
  if (from || to) {
    if (from) start = new Date(from);
    if (to) end = new Date(to);
  } else if (range) {
    ({ start, end } = rangeToWindow(range));
  }

  const where = {};
  if (start || end) {
    where.createdAt = {};
    if (start) where.createdAt.gte = start;
    if (end) where.createdAt.lte = end;
  }

  const grouped = await prisma.user.groupBy({
    by: ["role"],
    where,
    _count: { _all: true },
  });

  const counter = new Map();
  let total = 0;

  for (const row of grouped) {
    const raw = (row.role || "").trim().toLowerCase();
    const norm = ["anonimus", "anonymus", "anonymous"].includes(raw) ? "anonymus" : raw;
    const label = ROLE_LABELS[norm] ?? (row.role || "Khác");
    const value = row._count._all || 0;
    total += value;
    counter.set(label, (counter.get(label) ?? 0) + value);
  }

  const data = Array.from(counter.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .map(d => ({ ...d, percent: total ? +((d.value * 100) / total).toFixed(2) : 0 }));

  return { total, data };
}



module.exports = {
  getRoleDistribution,
  getStudentStats,
  getTeacherStats,
  getClassStats,
  // getDashboardStats,
};