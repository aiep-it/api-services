// src/controllers/roadmap/node.controller.js
const nodeService = require('../../services/node.service');
const roadmapService = require('../../services/roadmap.service');


exports.createNode = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can create nodes.' });
  }

  const { roadmapId } = req.body;

  const roadmap = await roadmapService.getRoadmapById(roadmapId);
  if (!roadmap) {
    return res.status(400).json({ message: 'Roadmap Not Found!' });
  }

  try {
    const newNode = await nodeService.createNode({ ...req.body });
    res.status(201).json(newNode);
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ message: 'Failed to create node.' });
  }
};

exports.completeNode = async (req, res) => {
  const userId = req.user.id;
  const { nodeId } = req.params;

  try {
    const result = await nodeService.completeNode(userId, nodeId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error completing node:', error);
    res.status(500).json({ message: 'Failed to mark node as completed.' });
  }
};
