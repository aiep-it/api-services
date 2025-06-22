const bookmarkService = require('../../services/bookmark.service');

exports.toggleBookmarkRoadmap = async (req, res) => {
  const userId = req.user?.id;
  const roadmapId = req.params.id;
  const { bookmark } = req.body;

  if (!userId || !roadmapId) {
    return res.status(400).json({ error: 'Missing user or roadmap ID.' });
  }

  try {
    const result = await bookmarkService.toggleBookmark(userId, roadmapId, bookmark);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Unexpected error occurred.' });
  }
};
