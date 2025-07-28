// utils/geminiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AI_CONFIG = require("../config/ai_config");

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBCSyeJlSevDH3zveNk3v8Xwu9It1fD9q8";
const MODEL_NAME = "gemini-2.5-flash";

let _model = null;

function initializeGeminiModel() {
  if (!_model) {
//     const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const geminiVision = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const genAI = new GoogleGenerativeAI(API_KEY);
    _model = genAI.getGenerativeModel({ model: MODEL_NAME });
    console.log(`[Gemini] Model '${MODEL_NAME}' initialized once.`);
  }
  return _model;
}

module.exports = initializeGeminiModel();
