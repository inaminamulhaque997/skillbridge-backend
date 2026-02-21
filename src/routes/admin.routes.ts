import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { updateUserSchema, createCategorySchema, updateCategorySchema } from '../validations/admin.validation.js';

const router = Router();

// All admin routes are protected
router.use(authenticate);
router.use(authorize('ADMIN'));

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', validate(updateUserSchema), adminController.updateUser);

// Booking management
router.get('/bookings', adminController.getAllBookings);

// Stats
router.get('/stats', adminController.getStats);

// Category management
router.post('/categories', validate(createCategorySchema), adminController.createCategory);
router.get('/categories', adminController.getAllCategories);
router.put('/categories/:id', validate(updateCategorySchema), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

export default router;
