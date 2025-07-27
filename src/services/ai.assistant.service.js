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
