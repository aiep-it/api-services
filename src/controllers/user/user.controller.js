// src/controllers/user/user.controller.js
const userService = require('../../services/user.service');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
// src/controllers/user/user.controller.js
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await userService.getAllTeachers();
    res.status(200).json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

exports.getUserByClerkId = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing Clerk user ID' });

  try {
    const user = await userService.getUserByClerkId(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user by Clerk ID:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.getLearningRoadmaps = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const bookmarks = await prisma.userRoadmapBookmark.findMany({
      where: { userId },
      include: {
        roadmap: {
          include: { nodes: true },
        },
      },
    });

    const learningRoadmaps = await Promise.all(
      bookmarks
        .filter((b) => !b.roadmap?.is_deleted)
        .map(async (b) => {
          const totalNodes = b.roadmap.nodes.length;
          const completed = await prisma.userNodeProgress.count({
            where: {
              userId,
              nodeId: { in: b.roadmap.nodes.map((n) => n.id) },
              isCompleted: true,
            },
          });

          const progressPercentage = totalNodes > 0 ? (completed / totalNodes) * 100 : 0;

          return {
            id: b.roadmap.id,
            name: b.roadmap.name,
            categoryId: b.roadmap.categoryId,
            type: b.roadmap.type,
            progressPercentage,
            is_deleted: b.roadmap.is_deleted,
          };
        })
    );

    return res.status(200).json(learningRoadmaps);
  } catch (err) {
    console.error('Error fetching learning roadmaps:', err);
    return res.status(500).json({ error: 'Failed to fetch learning roadmaps' });
  }
};

// exports.toggleBookmarkRoadmap = async (req, res) => {
//   const { id } = req.params; // roadmapId
//   const userId = req.user.id; // Lấy userId từ middleware xác thực
//   const { bookmark } = req.body; // true/false

//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized: User ID missing." });
//   }

//   try {
//     if (bookmark) { // Nếu muốn bookmark (thêm vào)
//       await prisma.userRoadmapBookmark.create({
//         data: {
//           userId: userId,
//           roadmapId: id,
//         },
//       });
//       res.status(200).json({ message: "Roadmap bookmarked successfully." });
//     } else { // Nếu muốn unbookmark (xóa khỏi)
//       await prisma.userRoadmapBookmark.delete({
//         where: {
//           userId_roadmapId: {
//             userId: userId,
//             roadmapId: id,
//           },
//         },
//       });
//       res.status(200).json({ message: "Roadmap unbookmarked successfully." });
//     }
//   } catch (error) {
//     console.error('Error toggling bookmark for roadmap:', error);
//     // Xử lý lỗi P2002 nếu user cố gắng bookmark roadmap đã tồn tại
//     if (error.code === 'P2002') {
//       return res.status(409).json({ message: 'Roadmap already bookmarked by this user.' });
//     }
//     // Xử lý lỗi P2025 nếu user cố gắng unbookmark roadmap không tồn tại
//     if (error.code === 'P2025') {
//         return res.status(404).json({ message: 'Bookmark not found to delete.' });
//     }
//     res.status(500).json({ message: 'Failed to toggle bookmark status.' });
//   }
// };
// src/controllers/user/user.controller.js
exports.getAllUsersWithClerkId = async (req, res) => {
  try {
    const users = await userService.getUsersWithClerkId();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users with Clerk ID:', err);
    res.status(500).json({ error: 'Failed to fetch users with Clerk ID' });
  }
};
