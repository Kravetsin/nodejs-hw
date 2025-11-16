// src/routes/studentsRoutes.js

import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  deleteStudentById,
  updateStudentById,
} from '../controllers/studentsController.js';

const router = Router();

router.get('/students', getStudents);
router.get('/students/:studentId', getStudentById);
router.post('/students', createStudent);
router.delete('/students/:studentId', deleteStudentById);
router.patch('/students/:studentId', updateStudentById);

export default router;
