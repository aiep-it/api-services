const prisma = require('../../lib/prisma');

exports.toggleBookmark = async (userId, roadmapId, bookmark) => {
  try {
    const existing = await prisma.UserRoadmap.findUnique({
      where: { userId_roadmapId: { userId, roadmapId } },
    });

    if (bookmark && !existing) {
      await prisma.UserRoadmap.create({
        data: { userId, roadmapId },
      });
      return { message: 'Roadmap bookmarked successfully.' };
    }

    if (!bookmark && existing) {
      await prisma.UserRoadmap.delete({
        where: { userId_roadmapId: { userId, roadmapId } },
      });
      return { message: 'Roadmap unbookmarked successfully.' };
    }

    return { message: 'No action taken.' };

  } catch (error) {
    if (error.code === 'P2002') {
      throw { status: 409, message: 'Roadmap already bookmarked by this user.' };
    }
    if (error.code === 'P2025') {
      throw { status: 404, message: 'Bookmark not found to delete.' };
    }
    console.error('Bookmark Service Error:', error);
    throw { status: 500, message: 'Failed to toggle bookmark status.' };
  }
};
