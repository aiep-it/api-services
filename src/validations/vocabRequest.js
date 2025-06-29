const Joi = require('joi')

// Schema valid base field for vocab model 
const vocabBaseSchema = {
  word: Joi.string().min(1).required(),
  meaning: Joi.string().min(1).required(),
  example: Joi.string().allow(''),
  imageUrl: Joi.string().uri().allow(''),
  audioUrl: Joi.string().uri().allow(''),
  is_know: Joi.boolean(),
  nodeId: Joi.string().required()
}

// Schema valid sort for get all vocabs req
const sortFieldSchema = Joi.object({
  field: Joi.string().valid('word', 'example', 'meaning', 'created_at', 'updated_at', 'is_know'),
  order: Joi.string().valid('asc', 'desc')
})

// Schema valid filter for get all vocabs req
const filterSchema = Joi.object({
  is_know: Joi.alternatives().try(
    Joi.boolean(),
    Joi.object({
      in: Joi.array().items(Joi.boolean())
    })
  ).optional(),
  created_at: Joi.object({
    gte: Joi.date(),
    lte: Joi.date()
  }).optional(),
  updated_at: Joi.object({
    gte: Joi.date(),
    lte: Joi.date()
  }).optional(),
  nodeId: Joi.string().optional(),
  word: Joi.string().optional(),
  example: Joi.string().optional()
})

// Schema valid req for get all vocabs 
const getAllVocabsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').default(''),
  sort: Joi.array().items(sortFieldSchema).default([{ field: 'created_at', order: 'desc' }]),
  filters: filterSchema.default({})
})

// Schema valid req for create vocab
const createVocabSchema = Joi.object(vocabBaseSchema)

// Schema valid req for update vocab
const updateVocabSchema = Joi.object(vocabBaseSchema)

module.exports = {
  getAllVocabsSchema,
  createVocabSchema,
  updateVocabSchema
}