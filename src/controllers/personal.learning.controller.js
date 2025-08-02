const { generatePersonalLearningFromImage } = require('../services/personal.learning.service');

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

module.exports = {
    generatePersonalLearningFromImageHandler,
};