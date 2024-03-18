/* eslint-disable import/prefer-default-export */
import Joi from 'joi';

const getBirdByIdValidator = Joi.object({
  id: Joi.number().integer().positive().messages({
    'any.required': "The 'id' field is required.",
    'number.integer': "The 'id' field must be an integer.",
    'number.positive': "The 'id' field must be a positive number.",
  }),
});

export { getBirdByIdValidator };
