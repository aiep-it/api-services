const Joi = require('joi');


const createStudentSchema = Joi.object({
  fullName: Joi.string().min(3).max(255).required().messages({
    'string.base': `"fullName" phải là chuỗi.`,
    'string.empty': `"fullName" không được để trống.`,
    'string.min': `"fullName" phải có ít nhất {#limit} ký tự.`,
    'any.required': `"fullName" là bắt buộc.`,
  }),

  parentName: Joi.string().min(3).max(255).required().messages({
    'string.base': `"parentName" phải là chuỗi.`,
    'string.empty': `"parentName" không được để trống.`,
    'string.min': `"parentName" phải có ít nhất {#limit} ký tự.`,
    'any.required': `"parentName" là bắt buộc.`,
  }),

  parentPhone: Joi.string()
    .pattern(/^(0|\+84)[0-9]{9}$/)
    .required()
    .messages({
      'string.base': `"parentPhone" phải là chuỗi.`,
      'string.empty': `"parentPhone" không được để trống.`,
      'string.pattern.base': `"parentPhone" không hợp lệ. Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10 số.`,
      'any.required': `"parentPhone" là bắt buộc.`,
    }),

  address: Joi.string().min(5).max(255).required().messages({
    'string.base': `"address" phải là chuỗi.`,
    'string.empty': `"address" không được để trống.`,
    'string.min': `"address" phải có ít nhất {#limit} ký tự.`,
    'any.required': `"address" là bắt buộc.`,
  }),
});

module.exports = {
  createStudentSchema,
};
