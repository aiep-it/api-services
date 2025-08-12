
const {
  generateVocabFromImage,
  generateImageFromPrompt,
  generateQuiz
} = require('../services/ai.assistant.service');

const topicService = require('../services/topic.service');
const vocabService = require('../services/vocab.service');

const generateVocabFromImageHandler = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        message: 'Image is required',
      });
    }

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

const generateQuizHandler = async (req, res) => {
  try {
    const { topicId, difficulty,  content } = req.body;
    
    if (!topicId) {
      return res.status(400).json({ message: "Missing topicId in request body" });
    }

    const topic = await topicService.getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const { title: topicTitle } = topic;

    const listVocabsExist = await vocabService.getAllVocabsByTopicId(topicId);
    
    const wordsExist = listVocabsExist?.map(vocab => vocab.word);


    const result = await generateQuiz(topicTitle, difficulty, wordsExist, content);
    return res.status(200).json({
      message: 'Quiz question generated successfully',
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
  generateQuizHandler,
};
