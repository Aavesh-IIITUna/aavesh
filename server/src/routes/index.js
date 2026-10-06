import { Router } from 'express';
import {
  getSociety,
  getTracks,
  listProjects,
  listMembers,
} from '../controllers/societyController.js';
import { createMessage, listMessages } from '../controllers/contactController.js';

const router = Router();

router.get('/society', getSociety);
router.get('/society/tracks', getTracks);
router.get('/projects', listProjects);
router.get('/members', listMembers);

router.post('/contact', createMessage);
router.get('/contact', listMessages);

export default router;