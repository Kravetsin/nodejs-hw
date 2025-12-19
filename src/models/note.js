import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    tag: {
      type: String,
      enum: [...TAGS],
      default: 'Todo',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

noteSchema.index(
  { title: 'text', content: 'text' },
  {
    name: 'NoteTextIndex',
    default_language: 'english',
    weights: { title: 5, content: 1 },
  }
);

export const Note = model('Note', noteSchema);
