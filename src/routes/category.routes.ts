import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// Public route - get all categories
router.get('/', adminController.getAllCategories);

export default router;
