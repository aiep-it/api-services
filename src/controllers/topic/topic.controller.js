// src/controllers/topic/topic.controller.js
const topicService = require('../../services/topic.service');
const roadmapService = require('../../services/roadmap.service');


exports.createTopic = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Forbidden: Only admin or staff can create topics.' });
  }

  const { roadmapId } = req.body;

  const roadmap = await roadmapService.getRoadmapById(roadmapId);
  if (!roadmap) {
    return res.status(400).json({ message: 'Roadmap Not Found!' });
  }

  try {
    const newTopic = await topicService.createTopic({ ...req.body });
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: 'Failed to create topic.' });
  }
};

exports.completeTopic = async (req, res) => {
  const userId = req.user.id;
  const { topicId } = req.params;

  try {
    const result = await topicService.completeTopic(userId, topicId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error completing topic:', error);
    res.status(500).json({ message: 'Failed to mark topic as completed.' });
  }
};

exports.getTopicById = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await topicService.getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }
    res.status(200).json(topic);
  } catch (error) {
    console.error('Error fetching topic by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve topic.' });
  }
}

exports.getTopicsByRoadmapId = async (req, res) => {
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
    const topics = await topicService.getByRoadMapId(roadmapId, paggingRequest);
    res.status(200).json(topics);
  } catch (error) {
    console.error('Error fetching topics by roadmap ID:', error);
    res.status(500).json({ message: 'Failed to retrieve topics.' });
  }
}

exports.updateTopic = async (req, res) => {
  const { topicId } = req.params;

  const {isMyWorkspace, ...data} = req.body

  try {
    const updatedTopic = await topicService.updateTopic(topicId, data);
    res.status(200).json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(400).json({ message: 'Failed to update topic.' });
  }
}

