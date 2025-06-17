const Joi = require('joi');

// Schema validate create
const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': `"name" should be a type of 'text'`,
    'string.empty': `"name" cannot be an empty field`,
    'string.min': `"name" should have a minimum length of {#limit}`,
    'any.required': `"name" is a required field`,
  }),
  email: Joi.string().email().required().messages({
    'string.email': `"email" must be a valid email`,
    'any.required': `"email" is required`,
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': `"password" should have a minimum length of {#limit}`,
    'any.required': `"password" is required`,
  }),
  role: Joi.string().valid('user', 'admin','staff').optional(),
});

// Schema validate cupdate
const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('user', 'admin','staff').optional(),
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema,
};
