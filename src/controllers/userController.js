const { Clerk } = require('@clerk/clerk-sdk-node');

const updateUserMetadata = async (req, res) => {
  const { userId, role } = req.body;
  try {
    await Clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
    res.status(200).json({ message: 'Metadata updated' });
  } catch (err) {
    console.error('Error updating metadata:', err);
    res.status(500).json({ error: 'Failed to update metadata' });
  }
};

module.exports = { updateUserMetadata };









































// const UserModel = require('../models/user.model');

// const userController = {
//   getAllUsers: async (req, res) => {
//     try {
//       const users = await UserModel.findAll();
//       res.json(users);
//     } catch (error) {
//       console.error('Error getting users:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   getUserById: async (req, res) => {
//     try {
//       const id = parseInt(req.params.id);
//       const user = await UserModel.findById(id);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       res.json(user);
//     } catch (error) {
//       console.error('Error getting user:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   createUser: async (req, res) => {
//     try {
      
//       const { name, email, password, role } = req.body;
//       console.log({ name, email, password, role })
//       const newUser = await UserModel.create({ name, email, password, role });
//       res.status(201).json(newUser);
//     } catch (error) {
//       console.error('Error creating user:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   updateUser: async (req, res) => {
//     try {
//       const id = parseInt(req.params.id);
//       const data = req.body;
//       const updatedUser = await UserModel.update(id, data);
//       res.json(updatedUser);
//     } catch (error) {
//       console.error('Error updating user:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   deleteUser: async (req, res) => {
//     try {
//       const id = parseInt(req.params.id);
//       await UserModel.delete(id);
//       res.status(204).send(); // No content
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },
  
// };

// module.exports = userController;