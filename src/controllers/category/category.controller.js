// src/controllers/category/category.controller.js
const categoryService = require('../../services/category.service');

exports.createCategory = async (req, res) => {
  if (req.user.role?.toLowerCase() !== 'admin' && req.user.role?.toLowerCase() !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can create categories.' });
  }

  const type = "?"
  const { name,  description, order } = req.body;
  // if (!name || !type) {
  //   return res.status(400).json({ message: 'Name and type are required.' });
  // }

  try {
    const category = await categoryService.createCategory({ name, type, description, order });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error.message);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Category with this name already exists.' });
    }
    res.status(500).json({ message: 'Failed to create category.' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    // console.log("Fetched categories:", categories);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Failed to retrieve categories.' });
  }
};

exports.updateCategory = async (req, res) => {
  if (req.user.role?.toLowerCase() !== 'admin' && req.user.role?.toLowerCase() !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can update categories.' });
  }

  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating category:', error.message);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Category with this name already exists.' });
    }
    res.status(500).json({ message: 'Failed to update category.' });
  }
};

exports.deleteCategory = async (req, res) => {
  if (req.user.role?.toLowerCase() !== 'admin' && req.user.role?.toLowerCase() !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can delete categories.' });
  }

  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error.message);
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'Cannot delete category: It is linked to existing roadmaps.' });
    }
    res.status(500).json({ message: 'Failed to delete category.' });
  }
};
