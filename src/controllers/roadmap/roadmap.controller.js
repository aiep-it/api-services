// src/controllers/roadmap/roadmap.controller.js
const roadmapService = require('../../services/roadmap.service');

exports.createRoadmap = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can create roadmaps.' });
  }

  try {
    const newRoadmap = await roadmapService.createRoadmap(req.body);
    res.status(201).json(newRoadmap);
  } catch (error) {
    console.error('Error creating roadmap:', error);
    res.status(500).json({ message: 'Failed to create roadmap.' });
  }
};

exports.getAllRoadmaps = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  try {
    const roadmaps = await roadmapService.getAllRoadmaps(userId);
    res.status(200).json(roadmaps);
  } catch (error) {
    console.error('Error fetching all roadmaps:', error);
    res.status(500).json({ message: 'Failed to retrieve roadmaps.' });
  }
};

exports.getRoadmapById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    const roadmap = await roadmapService.getRoadmapById(id, userId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }
    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve roadmap.' });
  }
};

exports.updateRoadmap = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can update roadmaps.' });
  }

  try {
    const updatedRoadmap = await roadmapService.updateRoadmap(req.params.id, req.body);
    res.status(200).json(updatedRoadmap);
  } catch (error) {
    console.error('Error updating roadmap:', error);
    res.status(500).json({ message: 'Failed to update roadmap.' });
  }
};

exports.deleteRoadmap = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can delete roadmaps.' });
  }

  try {
    await roadmapService.softDeleteRoadmap(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ message: 'Failed to delete roadmap.' });
  }
};
