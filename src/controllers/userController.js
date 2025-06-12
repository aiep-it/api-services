// api-services/src/controllers/userController.js
const { createClerkClient } = require('@clerk/backend');

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

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

module.exports = { updateUserMetadata };