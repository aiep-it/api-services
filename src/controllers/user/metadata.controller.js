// src/controllers/user/metadata.controller.js
const userService = require('../../services/user.service');

exports.updateUserMetadata = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ error: 'userId and role are required' });
  }

  try {
    const result = await userService.updateUserMetadata(userId, role);
    console.log('Metadata updated:', { userId, role });
    res.status(200).json(result);
  } catch (err) {
    console.error('Error updating metadata:', err);
    res.status(500).json({ error: 'Failed to update metadata' });
  }
};
