const prisma = require('../../lib/prisma');

// ➕ Tạo Category (Admin / Staff)
exports.createCategory = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can create categories.' });
  }

  const { name, type, description, order } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required.' });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
        description,
        order: order || 0
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error.message);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Category with this name already exists.' });
    }
    res.status(500).json({ message: 'Failed to create category.' });
  }
};

// 📥 Lấy tất cả Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Failed to retrieve categories.' });
  }
};

// 🔍 Lấy Category theo ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category by ID:', error.message);
    res.status(500).json({ message: 'Failed to retrieve category.' });
  }
};

// ✏️ Cập nhật Category (Admin / Staff)
exports.updateCategory = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can update categories.' });
  }

  const { id } = req.params;
  const { name, type, description, order } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, type, description, order },
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error.message);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Category with this name already exists.' });
    }
    res.status(500).json({ message: 'Failed to update category.' });
  }
};

// ❌ Xoá Category (Admin / Staff)
exports.deleteCategory = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can delete categories.' });
  }

  const { id } = req.params;

  try {
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error.message);
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'Cannot delete category: It is linked to existing roadmaps.' });
    }
    res.status(500).json({ message: 'Failed to delete category.' });
  }
};
