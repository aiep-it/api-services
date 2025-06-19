// src/controllers/roadmapController.js
const prisma = require('../../lib/prisma'); // Import Prisma Client

// Hàm trợ giúp để tính toán tiến độ
async function calculateUserRoadmapProgress(userId, roadmapId) {
  const totalNodes = await prisma.node.count({
    where: { roadmapId: roadmapId },
  });

  if (totalNodes === 0) {
    return 0; // Tránh chia cho 0 nếu không có node
  }

  const completedNodes = await prisma.userNodeProgress.count({
    where: {
      userId: userId,
      nodeId: {
        in: (await prisma.node.findMany({ // Lấy IDs của các node thuộc roadmap này
          where: { roadmapId: roadmapId },
          select: { id: true }
        })).map(node => node.id),
      },
      isCompleted: true,
    },
  });

  return (completedNodes / totalNodes) * 100;
}

// Hàm trợ giúp để lấy trạng thái bookmark
async function getUserBookmarkStatus(userId, roadmapId) {
  if (!userId) return false; // Nếu không có user, coi như không bookmarked

  const bookmark = await prisma.userRoadmapBookmark.findUnique({
    where: {
      userId_roadmapId: {
        userId: userId,
        roadmapId: roadmapId,
      },
    },
  });
  return !!bookmark; // Trả về true nếu bookmark tồn tại, false nếu không
}


// 1. Tạo Roadmap (Admin)
exports.createRoadmap = async (req, res) => {
  // Chỉ admin/staff mới có quyền tạo
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can create roadmaps.' });
  }

  const { name, categoryId, type, isNew } = req.body; // Thêm isNew
  if (!name || !categoryId || !type) {
    return res.status(400).json({ message: 'Name, categoryId, and type are required.' });
  }

  try {
    const newRoadmap = await prisma.roadmap.create({
      data: {
        name,
        categoryId,
        type,
        isNew: isNew || false, // Đặt giá trị mặc định nếu không có
      },
    });
    res.status(201).json(newRoadmap);
  } catch (error) {
    console.error('Error creating roadmap:', error);
    res.status(500).json({ message: 'Failed to create roadmap.' });
  }
};


// 2. Lấy tất cả Roadmaps (kèm tiến độ và trạng thái bookmark người dùng nếu có)
exports.getAllRoadmaps = async (req, res) => {
  const userId = req.user ? req.user.id : null; // Lấy userId từ request nếu đã đăng nhập

  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: {
        is_deleted: false, // Chỉ lấy các roadmap chưa bị xóa mềm
      },
      // Không cần include nodes ở đây để tránh tải dữ liệu lớn không cần thiết
    });

    const roadmapsWithUserStatus = await Promise.all(roadmaps.map(async (roadmap) => {
      let progressPercentage = 0;
      let isBookmarked = false; // Mặc định là false

      if (userId) {
        progressPercentage = await calculateUserRoadmapProgress(userId, roadmap.id);
        isBookmarked = await getUserBookmarkStatus(userId, roadmap.id); // Lấy trạng thái bookmark
      }
      return { ...roadmap, progressPercentage, isBookmarked };
    }));

    res.status(200).json(roadmapsWithUserStatus);

  } catch (error) {
    console.error('Error fetching all roadmaps:', error);
    res.status(500).json({ message: 'Failed to retrieve roadmaps.' });
  }
};


// 3. Lấy Roadmap theo ID (kèm tiến độ và trạng thái bookmark người dùng nếu có)
exports.getRoadmapById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id, is_deleted: false },
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }

    let progressPercentage = 0;
    let isBookmarked = false; // Mặc định là false
    if (userId) {
      progressPercentage = await calculateUserRoadmapProgress(userId, roadmap.id);
      isBookmarked = await getUserBookmarkStatus(userId, roadmap.id); // Lấy trạng thái bookmark
    }

    res.status(200).json({ ...roadmap, progressPercentage, isBookmarked });
  } catch (error) {
    console.error('Error fetching roadmap by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve roadmap.' });
  }
};


// 4. Cập nhật Roadmap (Admin)
exports.updateRoadmap = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can update roadmaps.' });
  }

  const { id } = req.params;
  const { name, categoryId, type, is_deleted, deleted_at, isNew } = req.body; // Thêm isNew

  try {
    const updatedRoadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        name: name || undefined,
        categoryId: categoryId || undefined,
        type: type || undefined,
        is_deleted: is_deleted !== undefined ? is_deleted : undefined,
        deleted_at: deleted_at !== undefined ? deleted_at : undefined,
        isNew: isNew !== undefined ? isNew : undefined, // Cập nhật isNew
      },
    });
    res.status(200).json(updatedRoadmap);
  } catch (error) {
    console.error('Error updating roadmap:', error);
    res.status(500).json({ message: 'Failed to update roadmap.' });
  }
};


// 5. Xóa mềm Roadmap (Admin)
exports.deleteRoadmap = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can delete roadmaps.' });
  }

  const { id } = req.params;

  try {
    await prisma.roadmap.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ message: 'Failed to delete roadmap.' });
  }
};

//   Toggle Bookmark cho Roadmap (User)
exports.toggleBookmarkRoadmap = async (req, res) => {
  const { id } = req.params; // roadmapId
  const userId = req.user.id; // Lấy userId từ middleware xác thực
  const { bookmark } = req.body; // true/false

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing." });
  }

  try {
    if (bookmark) { // Nếu muốn bookmark (thêm vào)
      await prisma.userRoadmapBookmark.create({
        data: {
          userId: userId,
          roadmapId: id,
        },
      });
      res.status(200).json({ message: "Roadmap bookmarked successfully." });
    } else { // Nếu muốn unbookmark (xóa khỏi)
      await prisma.userRoadmapBookmark.delete({
        where: {
          userId_roadmapId: {
            userId: userId,
            roadmapId: id,
          },
        },
      });
      res.status(200).json({ message: "Roadmap unbookmarked successfully." });
    }
  } catch (error) {
    console.error('Error toggling bookmark for roadmap:', error);
    // Xử lý lỗi P2002 nếu user cố gắng bookmark roadmap đã tồn tại
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Roadmap already bookmarked by this user.' });
    }
    // Xử lý lỗi P2025 nếu user cố gắng unbookmark roadmap không tồn tại
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Bookmark not found to delete.' });
    }
    res.status(500).json({ message: 'Failed to toggle bookmark status.' });
  }
};


// 6. Đánh dấu Node đã hoàn thành (User)
exports.completeNode = async (req, res) => {
  const userId = req.user.id;
  const { nodeId } = req.params;

  try {
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      select: { id: true, roadmapId: true }
    });

    if (!node) {
      return res.status(404).json({ message: 'Node not found.' });
    }

    const progress = await prisma.userNodeProgress.upsert({
      where: {
        userId_nodeId: {
          userId: userId,
          nodeId: nodeId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId: userId,
        nodeId: nodeId,
        roadmapId: node.roadmapId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    const updatedProgressPercentage = await calculateUserRoadmapProgress(userId, node.roadmapId);

    // Tự động bookmark roadmap khi Node đầu tiên được hoàn thành
    // Hoặc nếu bạn muốn tách bookmark và tiến độ, bạn có thể gọi API bookmark ở đây
    // await prisma.userRoadmapBookmark.upsert({
    //   where: { userId_roadmapId: { userId, roadmapId: node.roadmapId } },
    //   update: {},
    //   create: { userId: userId, roadmapId: node.roadmapId },
    // });


    res.status(200).json({
      message: 'Node marked as completed.',
      nodeProgress: progress,
      roadmapId: node.roadmapId,
      updatedRoadmapProgressPercentage: updatedProgressPercentage
    });
  } catch (error) {
    console.error('Error completing node:', error);
    res.status(500).json({ message: 'Failed to mark node as completed.' });
  }
};


// Hàm tạo Node mẫu (dành cho Admin, để có Node thử nghiệm)
exports.createNode = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can create nodes.' });
  }
  const { roadmapId, title, description } = req.body;
  if (!roadmapId || !title) {
    return res.status(400).json({ message: 'Roadmap ID and title are required.' });
  }
  try {
    const newNode = await prisma.node.create({
      data: { roadmapId, title, description },
    });
    res.status(201).json(newNode);
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ message: 'Failed to create node.' });
  }
};
