// First, install the library: npm install @google/generative-ai

const AI_Assistant = require("../config/geminiClient"); // Reuse the singleton
const AI_CONFIG = require("../config/ai_config");

exports.generateVocabularyData = async (topic) => {
  if (!AI_Assistant) {
    throw new Error(
      "Gemini model has not been initialized. Call initializeGeminiModel() first."
    );
  }
  if (!topic) {
    throw new Error(
      "Topic or list of words is required to generate vocabulary."
    );
  }

  const userRequest =
    AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.userContextFormat(topic);

  const systemPrompt = AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.sys_promt;

  try {
    const result = await AI_Assistant.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + userRequest }] },
      ],
      generationConfig: AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.generationConfig,
    });

    const response = result.response;
    const jsonText = response.text();
    const parsedData = JSON.parse(jsonText);
    return parsedData;

    // return
  } catch (error) {
    console.log("error", error);
    return [];
  }
};

exports.suggestTopics = async (topic) => {
  if (!AI_Assistant) {
    throw new Error(
      "Gemini model has not been initialized. Call initializeGeminiModel() first."
    );
  }
  if (!topic) {
    throw new Error(
      "Topic or list of words is required to generate vocabulary."
    );
  }

  const userRequest =
    AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.userContextFormat(topic);

  const systemPrompt = AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.sys_promt;

  try {
    const result = await AI_Assistant.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + userRequest }] },
      ],
      generationConfig: AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.generationConfig,
    });

    const response = result.response;
    const jsonText = response.text();
    const parsedData = JSON.parse(jsonText);
    return parsedData;

    // return
  } catch (error) {
    console.log("error", error);
    return [];
  }
};

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

/**
 * Generates vocabulary data from an image file using Gemini Vision.
 *
 * @param {object} AI_Assistant - instance of model Gemini
 * @param {object} file - image file object containing buffer and mimetype
 */
exports.generateVocabFromImage = async (file) => {

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
  if (!AI_CONFIG?.ADMIN_ASSISTANT?.VOCAB_CONFIG?.sys_promt) {
    throw new Error("System prompt is not defined in AI_CONFIG.");
  }

  const prompt = AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.sys_promt;


  const imagePart = {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };

  try {
    const result = await AI_Assistant.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text();

    console.log("Text Generating", responseText);

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

// exports.generateVocabFromImage = async (file) => {

//    if (!AI_Assistant) {
//     throw new Error(
//       "Gemini model has not been initialized. Call initializeGeminiModel() first."
//     );
//   }
//   if (!file || !file.buffer) {
//     throw new Error("Image file is required to generate vocabulary.");
//   }
//   // const model = geminiVision.getGenerativeModel({
//   //   model: 'gemini-pro-vision',
//   // });
//   const prompt = AI_CONFIG.ADMIN_ASSISTANT.VOCAB_CONFIG.sys_promt;
//   const image = {
//     inlineData: {
//       data: file.buffer.toString('base64'),
//       mimeType: file.mimetype,
//     },
//   };
//   const result = await AI_Assistant.generateContent([prompt, image]);
//   const response = await result.response;

//   console.log('Response from Gemini:', response);
//   const text = response.text();

//   console.log('Response text:', JSON.parse(text));
//   return JSON.parse(text);

// };
