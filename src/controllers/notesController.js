import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

//! Get all notes
export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const skip = (page - 1) * perPage;

  //* Build query with optional filters
  const notesQuery = Note.find({ userId: req.user._id });

  //* Apply tag filter if provided
  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  //* Apply text search if provided
  if (search) {
    notesQuery.where({
      $text: { $search: search },
    });
  }

  //* Execute query and get total count
  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);

  //* Calculate total pages
  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

//! Get a note by id
export const getNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOne({ _id: noteId, userId: req.user._id });

  //* Handle note not found
  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

//! Create a new note
export const createNote = async (req, res) => {
  const note = await Note.create({ ...req.body, userId: req.user._id });
  res.status(201).json(note);
};

//! Delete a note by id
export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  //* Handle note not found
  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

//! Update a note by id
export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  //* Find and update the note
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id }, //? Search by id and userId
    req.body,
    { new: true } //? return the updated document
  );

  //* Handle note not found
  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};
