import { Router } from 'express';
import * as tutorController from '../controllers/tutor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Public routes
router.get('/', tutorController.getAllTutors);
router.get('/:id', tutorController.getTutorById);
router.get('/:id/availability', tutorController.getTutorAvailability);

export default router;
