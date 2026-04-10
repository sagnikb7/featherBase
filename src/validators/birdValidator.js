import Joi from 'joi';

const getBirdByIdValidator = Joi.object({
  id: Joi.number().integer().positive().messages({
    'any.required': "The 'id' field is required.",
    'number.integer': "The 'id' field must be an integer.",
    'number.positive': "The 'id' field must be a positive number.",
  }),
});

const getAllBirdsValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(10),
  family: Joi.string().trim().max(100),
  group: Joi.string().trim().max(100),
  order: Joi.string().trim().max(100),
});

export { getBirdByIdValidator, getAllBirdsValidator };
