const AI_Assistant = require("../config/geminiClient"); // Reuse the singleton
const AI_CONFIG = require("../config/ai_config");

function safeJsonParse(text) {
  try {
    // Cố gắng phân tích cú pháp trực tiếp
    return JSON.parse(text);
  } catch (e) {
    console.warn(
      "Error.",
      e.message
    );
    // Nếu thất bại, hãy thử tìm một khối mã JSON trong văn bản
    // Ví dụ: ```json\n{...}\n```
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        console.error(
          "Error parsing JSON from text:",
          e2.message
        );
        return null;
      }
    }
    console.error("Don't find JSON in text:", text);
    return null;
  }
}

const generatePersonalLearningFromImage = async (file) => {
  if (!AI_Assistant) {
    throw new Error(
      "Gemini model has not been initialized. Call initializeGeminiModel() first."
    );
  }
  if (!file || !file.buffer || !file.mimetype) {
    throw new Error(
      "File with image data is required to generate vocabulary."
    );
  }
  if (!AI_CONFIG?.ADMIN_ASSISTANT?.VISION_CONFIG?.sys_promt) {
    throw new Error("System prompt is not defined in AI_CONFIG.");
  }

  const prompt = AI_CONFIG.ADMIN_ASSISTANT.VISION_CONFIG.userContextFormat('');

  const imagePart = {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };

  try {
    const result = await AI_Assistant.generateContent([prompt, imagePart]);



    console.log("Text Generating", result.response?.candidates);
    const response = await result.response;
    const responseText = response.text();

    const vocabularyObject = safeJsonParse(responseText);

    if (!vocabularyObject) {
      throw new Error(
        "Phân tích cú pháp JSON từ phản hồi của Gemini thất bại. Phản hồi không chứa JSON hợp lệ."
      );
    }

    console.log(
      "Đối tượng từ vựng đã phân tích cú pháp thành công:",
      vocabularyObject
    );
    return vocabularyObject;
  } catch (error) {
    console.error(
      "Đã xảy ra lỗi khi gọi API Gemini hoặc xử lý phản hồi:",
      error
    );
    throw new Error(`Lỗi khi tạo từ vựng: ${error.message}`);
  }
};

const getPersonalLearningByUserId = async (userId) => {
  return await prisma.personalLearning.findMany({
    where: {
      userId: userId,
    },
  });
};

const createPersonalLearning = async (data) => {
  return await prisma.personalLearning.create({
    data,
  });
};

const updatePersonalLearning = async (id, data) => {
  return await prisma.personalLearning.update({
    where: {
      id,
    },
    data,
  });
};

const deletePersonalLearning = async (id) => {
  return await prisma.personalLearning.delete({
    where: {
      id,
    },
  });
};

module.exports = {
  getPersonalLearningByUserId,
  createPersonalLearning,
  updatePersonalLearning,
  deletePersonalLearning,
  generatePersonalLearningFromImage,
};