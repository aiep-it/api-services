const Joi = require("joi");

const createUserExerciseResult = Joi.object({
  exerciseId: Joi.string().required(),
  answer: Joi.string().required(),
  isCorrect: Joi.boolean().required(),
});

const updateUserExerciseResult = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    answer: Joi.string(),
    isCorrect: Joi.boolean(),
  }),
};

module.exports = {
  createUserExerciseResult,
  updateUserExerciseResult,
};
