// utils/geminiClient.js
// import {  DynamicRetrievalConfigMode } from "@google/genai";
const {
  GoogleGenerativeAI,
  DynamicRetrievalConfigMode,
} = require("@google/generative-ai");
const {
    GoogleGenAI
  } = require("@google/genai");
const AI_CONFIG = require("../config/ai_config");

const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyAntUmKWCkTL8Cjoa5fh8cTho0URkbrwRo";
const MODEL_NAME = "gemini-2.5-pro";
const IMAGE_MODEL_NAME = "imagen-3.0-generate-002";

let _model = null;
let _imageModel = null;

function initializeGeminiModel() {
  if (!_model) {
    //     const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const geminiVision = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Define the grounding tool
    const genAI = new GoogleGenerativeAI(API_KEY);
    _model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });
    console.log(`[Gemini] Model '${MODEL_NAME}' initialized once.`);
  }
  return _model;
}

function initializeImageModel() {
  if (!_imageModel) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    _imageModel = genAI.getGenerativeModel({
      model: IMAGE_MODEL_NAME,
    });
    console.log(`[Gemini] Image Model '${IMAGE_MODEL_NAME}' initialized once.`);
  }
  return _imageModel;
}

module.exports = {
  initializeGeminiModel: initializeGeminiModel(),
  initializeImageModel: initializeImageModel(),
  getGenAIInstance: () => new GoogleGenerativeAI(API_KEY),
  getGenAIImageGenerator: () => new GoogleGenAI({ apiKey: API_KEY }),
};
