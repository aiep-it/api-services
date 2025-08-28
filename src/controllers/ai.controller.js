const {
  generateVocabFromImage,
  generateImageFromPrompt,
  generateQuiz,
  genAIIMageFromText,
  generateQuizzFromImage,
} = require("../services/ai.assistant.service");

const topicService = require("../services/topic.service");
const vocabService = require("../services/vocab.service");

const { uploadFileToDirectus } = require("../services/directus.service");

const generateVocabFromImageHandler = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    console.log("Received file:", file.originalname);
    const result = await generateVocabFromImage(file);
    return res.status(200).json({
      message: "Generate vocab from image successfully",
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
        message: "Prompt is required",
      });
    }

    const result = await generateImageFromPrompt(prompt);
    return res.status(200).json({
      message: "Generate image successfully",
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
    const { topicId, difficulty, content } = req.body;

    if (!topicId) {
      return res
        .status(400)
        .json({ message: "Missing topicId in request body" });
    }

    const topic = await topicService.getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const { title: topicTitle } = topic;

    const listVocabsExist = await vocabService.getAllVocabsByTopicId(topicId);

    const wordsExist = listVocabsExist?.map((vocab) => vocab.word);

    const result = await generateQuiz(
      topicTitle,
      difficulty,
      wordsExist,
      content
    );
    return res.status(200).json({
      message: "Quiz question generated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const generateQuizMediaHandler = async (req, res) => {
  try {
    const { topicId, difficulty, content, type } = req.body;

    if (!topicId) {
      return res
        .status(400)
        .json({ message: "Missing topicId in request body" });
    }

    const topic = await topicService.getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const { title: topicTitle } = topic;

    const listVocabsExist = await vocabService.getAllVocabsByTopicId(topicId);

    const wordsExist = listVocabsExist?.map((vocab) => vocab.word);
    const randomWord =
      wordsExist[Math.floor(Math.random() * wordsExist.length)];

    console.log(
      "Randomly selected word for image generation:",
      randomWord,
      topicTitle
    );
    const promptContext = `
        Create an image for ${randomWord} not exist any text, letters, or written words.

        The image should:
        - Do NOT include any text, letters, or written words in the image.  
        - Clearly illustrate the vocabulary in a bright, playful, child-friendly style.  
        - Include enough visual context to allow a teacher to ask simple questions 
          (e.g., about color, size, quantity, or location).  
        - Be safe, positive, and engaging for children aged 6–15 years old.  
      

        Avoid scary, violent, or inappropriate content.
    `;
    const result = await genAIIMageFromText(promptContext);

    let quizz;
    if (result && result.image) {
      console.log(
        "Generate media for quiz options - to be implemented",
        result
      );

      if (type === "image") {
        const res = await generateQuizzFromImage(
          result.image,
          randomWord,
          difficulty
        );
        quizz = res[0] || {};
        const imgBytes = result.image.imageBytes;
        const buffer = Buffer.from(imgBytes, "base64");

        const timestamp = Date.now();
        const filename = `generated-image-${timestamp}.png`;
        const file = {
          buffer: buffer,
          originalname: filename,
          mimetype: "image/png", // Assuming PNG output
        }
        const directusFile = await uploadFileToDirectus(file);

        quizz.imageUrl = directusFile;
        quizz.assetId = directusFile;
      }
    }
    return res.status(200).json({
      message: "Quiz question generated successfully",
      data: quizz,
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
  generateQuizMediaHandler,
};
