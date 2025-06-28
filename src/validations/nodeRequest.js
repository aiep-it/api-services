const Joi = require("joi");

// Schema validate create
const createNodeSchema = Joi.object({
  title: Joi.string().min(3).max(30).required().messages({
    "string.base": `"name" should be a type of 'text'`,
    "string.empty": `"name" cannot be an empty field`,
    "string.min": `"name" should have a minimum length of {#limit}`,
    "any.required": `"name" is a required field`,
  }),
  description: Joi.string().min(10).max(500).optional().messages({
    "string.base": `"description" should be a type of 'text'`,
    "string.empty": `"description" cannot be an empty field`,
    "string.min": `"description" should have a minimum length of {#limit}`,
  }),
  roadmapId: Joi.string().required(),
});

module.exports = {
  createNodeSchema,
};
