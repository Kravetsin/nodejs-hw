import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllNotes,
  getNote,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  updateNoteSchema,
  createNoteSchema,
} from '../validations/notesValidation.js';

const router = Router();

//* Apply authentication middleware to all note routes
router.use('/notes', authenticate);

//* Route to get all notes
router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

//* Route to get a note by id
router.get('/notes/:noteId', celebrate(noteIdSchema), getNote);

//* Route to create a new note
router.post('/notes', celebrate(createNoteSchema), createNote);

//* Route to delete a note by id
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

//* Route to update a note by id
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

export default router;
