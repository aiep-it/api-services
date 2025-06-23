// src/controllers/roadmapController.js
const prisma = require('../../lib/prisma'); // Import Prisma Client

// Hàm trợ giúp để tính toán tiến độ
async function calculateUserRoadmapProgress(userId, roadmapId) {
  const totalNodes = await prisma.node.count({ where: { roadmapId } });
  if (totalNodes === 0) return 0;
  const nodeIds = (await prisma.node.findMany({ where: { roadmapId }, select: { id: true } })).map(n => n.id);
  const completedNodes = await prisma.userNodeProgress.count({ where: { userId, nodeId: { in: nodeIds }, isCompleted: true } });
  return (completedNodes / totalNodes) * 100;
}

// Hàm trợ giúp để lấy trạng thái bookmark
async function getUserBookmarkStatus(userId, roadmapId) {
  if (!userId) return false;
  const bookmark = await prisma.userRoadmapBookmark.findUnique({ where: { userId_roadmapId: { userId, roadmapId } } });
  return !!bookmark;
}

// 1. Tạo Roadmap (Admin)
exports.createRoadmap = async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const { name, categoryId, type, isNew } = req.body;
  if (!name || !categoryId || !type) return res.status(400).json({ message: 'Name, categoryId, and type are required.' });
  try {
    const newRoadmap = await prisma.roadmap.create({ data: { name, categoryId, type, isNew: isNew || false } });
    res.status(201).json(newRoadmap);
  } catch (err) {
    console.error('Error creating roadmap:', err);
    res.status(500).json({ message: 'Failed to create roadmap.' });
  }
};

// 2. Lấy tất cả Roadmaps (kèm tiến độ và bookmark)
exports.getAllRoadmaps = async (req, res) => {
  const userId = req.user?.id || null;
  try {
    const roadmaps = await prisma.roadmap.findMany({ where: { is_deleted: false } });
    const results = await Promise.all(roadmaps.map(async r => {
      const progress = userId ? await calculateUserRoadmapProgress(userId, r.id) : 0;
      const bookmarked = userId ? await getUserBookmarkStatus(userId, r.id) : false;
      return { ...r, progressPercentage: progress, isBookmarked: bookmarked };
    }));
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching all roadmaps:', err);
    res.status(500).json({ message: 'Failed to retrieve roadmaps.' });
  }
};

// 3. Lấy Roadmap theo ID
exports.getRoadmapById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || null;
  try {
    const roadmap = await prisma.roadmap.findUnique({ where: { id, is_deleted: false } });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });
    const progress = userId ? await calculateUserRoadmapProgress(userId, roadmap.id) : 0;
    const bookmarked = userId ? await getUserBookmarkStatus(userId, roadmap.id) : false;
    res.status(200).json({ ...roadmap, progressPercentage: progress, isBookmarked: bookmarked });
  } catch (err) {
    console.error('Error fetching roadmap by ID:', err);
    res.status(500).json({ message: 'Failed to retrieve roadmap.' });
  }
};

// 4. Cập nhật Roadmap
exports.updateRoadmap = async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const { id } = req.params;
  const { name, categoryId, type, is_deleted, deleted_at, isNew } = req.body;
  try {
    const updated = await prisma.roadmap.update({
      where: { id },
      data: { name, categoryId, type, is_deleted, deleted_at, isNew },
    });
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating roadmap:', err);
    res.status(500).json({ message: 'Failed to update roadmap.' });
  }
};

// 5. Xoá mềm Roadmap
exports.deleteRoadmap = async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const { id } = req.params;
  try {
    await prisma.roadmap.update({ where: { id }, data: { is_deleted: true, deleted_at: new Date() } });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting roadmap:', err);
    res.status(500).json({ message: 'Failed to delete roadmap.' });
  }
};

// 6. Toggle Bookmark
exports.toggleBookmarkRoadmap = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { bookmark } = req.body;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    if (bookmark) {
      await prisma.userRoadmapBookmark.create({ data: { userId, roadmapId: id } });
      res.status(200).json({ message: 'Bookmarked' });
    } else {
      await prisma.userRoadmapBookmark.delete({ where: { userId_roadmapId: { userId, roadmapId: id } } });
      res.status(200).json({ message: 'Unbookmarked' });
    }
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Already bookmarked' });
    if (err.code === 'P2025') return res.status(404).json({ message: 'Bookmark not found' });
    console.error('Error toggling bookmark:', err);
    res.status(500).json({ message: 'Failed to toggle bookmark status.' });
  }
};

// 7. Đánh dấu node hoàn thành
exports.completeNode = async (req, res) => {
  const userId = req.user.id;
  const { nodeId } = req.params;
  try {
    const node = await prisma.node.findUnique({ where: { id: nodeId }, select: { id: true, roadmapId: true } });
    if (!node) return res.status(404).json({ message: 'Node not found.' });
    const progress = await prisma.userNodeProgress.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: { isCompleted: true, completedAt: new Date() },
      create: { userId, nodeId, roadmapId: node.roadmapId, isCompleted: true, completedAt: new Date() },
    });
    const percentage = await calculateUserRoadmapProgress(userId, node.roadmapId);
    res.status(200).json({ message: 'Completed', nodeProgress: progress, roadmapId: node.roadmapId, updatedRoadmapProgressPercentage: percentage });
  } catch (err) {
    console.error('Error completing node:', err);
    res.status(500).json({ message: 'Failed to mark node as completed.' });
  }
};

// 8. Tạo Node (Admin)
exports.createNode = async (req, res) => {
  if (!['admin', 'staff'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  const { roadmapId, title, description } = req.body;
  if (!roadmapId || !title) return res.status(400).json({ message: 'Roadmap ID and title are required.' });
  try {
    const newNode = await prisma.node.create({ data: { roadmapId, title, description } });
    res.status(201).json(newNode);
  } catch (err) {
    console.error('Error creating node:', err);
    res.status(500).json({ message: 'Failed to create node.' });
  }
};
