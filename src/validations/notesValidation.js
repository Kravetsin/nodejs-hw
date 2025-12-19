import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

// Custom validator for MongoDB ObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

// Schema for validating noteId parameter
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

// Schema for creating a new note
export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required().messages({
      'string.empty': 'Title cannot be empty',
      'any.required': 'Title is required',
    }),
    content: Joi.string().allow(''),
    tag: Joi.string()
      .valid(
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo'
      )
      .messages({
        'any.only': 'Tag must be one of the predefined values',
      }),
  }),
};

// Schema for getting all notes with pagination
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
  }),
};

// Schema for updating a note
export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).messages({
      'string.empty': 'Title cannot be empty',
    }),
    content: Joi.string().allow(''),
    tag: Joi.string()
      .valid(
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo'
      )
      .messages({
        'any.only': 'Tag must be one of the predefined values',
      }),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field must be updated',
    }),
};
