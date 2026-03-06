import { Router } from 'express';
import {
  getDashboard,
  getUsers,
  toggleUserStatus,
  getPendingInstructors,
  approveInstructor,
  rejectInstructor,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  createCategory,
  updateCategory,
  getAuditLogs,
  getWithdrawals,
  processWithdrawal,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/instructors/pending', getPendingInstructors);
router.put('/instructors/:id/approve', approveInstructor);
router.put('/instructors/:id/reject', rejectInstructor);
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.get('/audit-logs', getAuditLogs);
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/process', processWithdrawal);

export default router;
