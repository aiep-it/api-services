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

exports.getNodeById = async (req, res) => {
  const { nodeId } = req.params;

  try {
    const node = await nodeService.getNodeById(nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Node not found.' });
    }
    res.status(200).json(node);
  } catch (error) {
    console.error('Error fetching node by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve node.' });
  }
}

exports.getNodesByRoadmapId = async (req, res) => {
  const { roadmapId } = req.params;

  try {
    const roadmap = await roadmapService.getRoadmapById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const orderBy = req.query.orderBy || 'createdAt';
    const skip = (page - 1) * limit;

    const paggingRequest = {
      page,
      limit,
      skip,
      orderBy
    }
    const nodes = await nodeService.getByRoadMapId(roadmapId, paggingRequest);
    res.status(200).json(nodes);
  } catch (error) {
    console.error('Error fetching nodes by roadmap ID:', error);
    res.status(500).json({ message: 'Failed to retrieve nodes.' });
  }
}

exports.updateNode = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can update nodes.' });
  }

  const { nodeId } = req.params;

  try {
    const updatedNode = await nodeService.updateNode(nodeId, req.body);
    res.status(200).json(updatedNode);
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(400).json({ message: 'Failed to update node.' });
  }
}
