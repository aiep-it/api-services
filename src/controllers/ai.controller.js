
const {
  generateVocabFromImage,
  generateImageFromPrompt,
} = require('../services/ai.assistant.service');
const { uploadFileToDirectus } = require('../services/directus.service');

const generateVocabFromImageHandler = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        message: 'Image is required',
      });
    }

    console.log('Received file:', file.originalname);
    const result = await generateVocabFromImage(file);
    return res.status(200).json({
      message: 'Generate vocab from image successfully',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const generateImageFromPromptHandler = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        message: 'Prompt is required',
      });
    }

    const result = await generateImageFromPrompt(prompt);
    return res.status(200).json({
      message: 'Generate image successfully',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateVocabFromImageHandler,
  generateImageFromPromptHandler,
};
