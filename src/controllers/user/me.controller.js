const userService = require('../../services/user.service');

exports.getCurrentUserRole = async (req, res) => {
  const userId = req.user?.clerkId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const role = await userService.getUserRoleByClerkId(userId);
    if (!role) return res.status(404).json({ error: 'User not found in database' });
    res.status(200).json({ role });
  } catch (err) {
    console.error('Error fetching user role:', err);
    res.status(500).json({ error: 'Failed to fetch user role' });
  }
};

exports.getUserMetrics = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const metrics = await userService.getUserMetrics(userId);
    res.status(200).json(metrics);
  } catch (err) {
    console.error('Error fetching user metrics:', err);
    res.status(500).json({ error: 'Failed to fetch user metrics' });
  }
};
