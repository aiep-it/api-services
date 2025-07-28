const Joi = require('joi');

const exerciseSchema = Joi.object({
  type: Joi.string().valid('text', 'image', 'audio').required(),
  content: Joi.string().required(),
  options: Joi.array().items(Joi.string()),
  correctAnswer: Joi.string().required(),
  hint: Joi.string().allow(null, ''),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').allow(null, ''),
  topicId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = {
  exerciseSchema,
};
