import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authRequired, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const enrollmentController = new EnrollmentController();

// Admin routes for managing student enrollments
router.post('/assign', authRequired, requireRole(['admin']), enrollmentController.assignCourse);
router.patch('/revoke', authRequired, requireRole(['admin']), enrollmentController.revokeCourse);
router.patch('/:id', authRequired, requireRole(['admin']), enrollmentController.updateEnrollment);
router.get('/', authRequired, requireRole(['admin']), enrollmentController.getAllEnrollments);

// Student routes
router.get('/my-courses', authRequired, requireRole(['student']), enrollmentController.getMyCourses);

export default router;
