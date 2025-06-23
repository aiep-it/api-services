const { createClerkClient } = require('@clerk/backend');
const prisma = require('../../lib/prisma');

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// POST /api/users/update-metadata
const updateUserMetadata = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ error: 'userId and role are required' });
  }
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
    console.log('Metadata updated:', { userId, role });
    return res.status(200).json({ message: 'Metadata updated' });
  } catch (err) {
    console.error('Error updating metadata:', err);
    return res.status(500).json({ error: 'Failed to update metadata' });
  }
};

// GET /api/users/me
const getCurrentUserRole = async (req, res) => {
  const userId = req.user?.clerkId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    return res.status(200).json({ role: user.role });
  } catch (err) {
    console.error('Error fetching user role:', err);
    return res.status(500).json({ error: 'Failed to fetch user role' });
  }
};

// GET /api/users/me/metrics
const getUserMetrics = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const learntToday = await prisma.userNodeProgress.count({
      where: {
        userId,
        isCompleted: true,
        completedAt: { gte: today },
      },
    });

    const projectsFinished = await prisma.userRoadmapBookmark.count({
      where: { userId },
    });

    const streak = 1;

    return res.status(200).json({ streak, learntToday, projectsFinished });
  } catch (err) {
    console.error('Error fetching user metrics:', err);
    return res.status(500).json({ error: 'Failed to fetch user metrics' });
  }
};

// POST /api/users/me/bookmarks/:roadmapId
const toggleRoadmapBookmark = async (req, res) => {
  const userId = req.user?.id;
  const roadmapId = req.params.roadmapId;
  const { bookmark } = req.body;

  if (!userId || !roadmapId) {
    return res.status(400).json({ error: 'Missing user or roadmap ID' });
  }

  try {
    const existing = await prisma.userRoadmapBookmark.findUnique({
      where: { userId_roadmapId: { userId, roadmapId } },
    });

    if (bookmark && !existing) {
      await prisma.userRoadmapBookmark.create({ data: { userId, roadmapId } });
    } else if (!bookmark && existing) {
      await prisma.userRoadmapBookmark.delete({
        where: { userId_roadmapId: { userId, roadmapId } },
      });
    }

    return res.status(200).json({ message: 'Bookmark updated' });
  } catch (err) {
    console.error('Error toggling bookmark:', err);
    return res.status(500).json({ error: 'Failed to update bookmark' });
  }
};

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    return res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET /api/users/:id
const getUserByClerkId = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing Clerk user ID' });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user by Clerk ID:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// GET /api/users/me/learning-roadmaps
const getLearningRoadmaps = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const bookmarks = await prisma.userRoadmapBookmark.findMany({
      where: { userId },
      include: {
        roadmap: true,
      },
    });

    const learningRoadmaps = bookmarks
      .filter(bookmark => bookmark.roadmap && !bookmark.roadmap.is_deleted)
      .map(bookmark => {
        const roadmap = bookmark.roadmap;
        return {
          id: roadmap.id,
          name: roadmap.name,
          categoryId: roadmap.categoryId,
          type: roadmap.type,
          progressPercentage: 0,
          is_deleted: roadmap.is_deleted,
        };
      });

    return res.status(200).json(learningRoadmaps);
  } catch (err) {
    console.error('❌ Error fetching learning roadmaps:', err);
    return res.status(500).json({ error: 'Failed to fetch learning roadmaps' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, role } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        role: role ?? undefined,
      },
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  updateUserMetadata,
  getCurrentUserRole,
  getUserMetrics,
  getAllUsers,
  getUserByClerkId,
  getLearningRoadmaps,
  toggleRoadmapBookmark,
  updateUser,
  deleteUser,
};
