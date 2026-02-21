import { Router } from 'express';
import * as tutorController from '../controllers/tutor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication and TUTOR role
router.use(authenticate);
router.use(authorize('TUTOR'));

router.get('/profile', tutorController.getMyProfile);
router.put('/profile', tutorController.updateMyProfile);
router.get('/availability', tutorController.getMyAvailability);
router.put('/availability', tutorController.updateMyAvailability);
router.get('/sessions', tutorController.getMySessions);

export default router;
