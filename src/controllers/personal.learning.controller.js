const { generatePersonalLearningFromImage } = require('../services/ai.assistant.service');
const { createPersonalLearning } = require('../services/personal.learning.service');

const generatePersonalLearningFromImageHandler = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        message: 'Image is required',
      });
    }

    console.log('Received file:', file.originalname);
    const result = await generatePersonalLearningFromImage(file);
    return res.status(200).json({
      message: 'Generate personal learning from image successfully',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const createPersonalLearningHandler = async (req, res) => {
  try {
    // req.user = user;
    const userId = req?.user?.id; // Assuming user ID is available in req.user
    // console.log('User ID from request:', req);
    if (!userId) {
      return res.status(401).json({message: 'Unauthorized: User ID is required'});
    }
    const { title, description,  vocabs, topicId, image } = req.body;
  

    const newPersonalLearning = await createPersonalLearning({
      userId,
      title,
      description,
      vocabs,
      topicId,
      image
    });

    return res.status(201).json({
      message: 'Personal learning created successfully',
      data: newPersonalLearning,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const { getPersonalLearningByUserId, updatePersonalLearning, deletePersonalLearning, getPersonalLearningByTopicId } = require('../services/personal.learning.service');

const getPersonalLearningByTopicIdHandler = async (req, res) => {
  try {
    const { topicId } = req.params;
    const personalLearningEntries = await getPersonalLearningByTopicId(topicId);
  
    return res.status(200).json({
      message: 'Personal learning entries retrieved successfully',
      data: personalLearningEntries || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getPersonalLearningByUserIdHandler = async (req, res) => {
  try {
    const userId = req?.user?.id; // Assuming user ID is available in req.user
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID is required' });
    }
    const personalLearningEntries = await getPersonalLearningByUserId(userId);
    if (!personalLearningEntries || personalLearningEntries.length === 0) {
      return res.status(404).json({
        message: 'No personal learning entries found for this user.',
      });
    }
    return res.status(200).json({
      message: 'Personal learning entries retrieved successfully',
      data: personalLearningEntries,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updatePersonalLearningHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = req.body;
    const updatedEntry = await updatePersonalLearning(id, dataToUpdate);
    if (!updatedEntry) {
      return res.status(404).json({
        message: 'Personal learning entry not found.',
      });
    }
    return res.status(200).json({
      message: 'Personal learning entry updated successfully',
      data: updatedEntry,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const deletePersonalLearningHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deletePersonalLearning(id);
    return res.status(204).json(); // No content for successful deletion
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generatePersonalLearningFromImageHandler,
  createPersonalLearningHandler,
  getPersonalLearningByUserIdHandler,
  updatePersonalLearningHandler,
  deletePersonalLearningHandler,
  getPersonalLearningByTopicIdHandler,
};