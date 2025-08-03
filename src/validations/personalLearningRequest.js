const Joi = require('joi');

const vocabSchema = Joi.object({
  word: Joi.string().required(),
  meaning: Joi.string().required(),
  example: Joi.string().optional().allow(null, ''),
  imageUrl: Joi.string().optional().allow(null, ''),
  audioUrl: Joi.string().optional().allow(null, ''),
  topicId: Joi.string().required()
});

const createPersonalLearningSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(3).required(),
  vocabs: Joi.array().items(vocabSchema).optional().default([]),
  topicId: Joi.string().required(),
  image: Joi.string().optional().allow(null, ''),
});

// const getPersonalLearningByUserIdSchema = Joi.object({
//   userId: Joi.string().required(),
// });

const updatePersonalLearningSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().min(3).max(255).optional(),
  description: Joi.string().min(3).optional(),
  learningObjectives: Joi.array().items(Joi.string()).optional(),
  vocabs: Joi.array().items(vocabSchema).optional(),
  topicId: Joi.string().optional(),
}).min(1);

const deletePersonalLearningSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = {
  createPersonalLearningSchema,
  // getPersonalLearningByUserIdSchema,
  updatePersonalLearningSchema,
  deletePersonalLearningSchema,
};
