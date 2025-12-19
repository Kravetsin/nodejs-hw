import { Router } from 'express';
import {
  getAllNotes,
  getNote,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

const router = Router();

//* Route to get all notes
router.get('/notes', getAllNotes);

//* Route to get a note by id
router.get('/notes/:noteId', getNote);

//* Route to create a new note
router.post('/notes', createNote);

//* Route to delete a note by id
router.delete('/notes/:noteId', deleteNote);

//* Route to update a note by id
router.patch('/notes/:noteId', updateNote);

export default router;
