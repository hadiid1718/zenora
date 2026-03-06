import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Skeleton fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
  </div>
);

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Student / Public
const HomePage = lazy(() => import('./pages/student/HomePage'));
const CoursesPage = lazy(() => import('./pages/student/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/student/CourseDetailPage'));
const MyCoursesPage = lazy(() => import('./pages/student/MyCoursesPage'));
const LearningPage = lazy(() => import('./pages/student/LearningPage'));
const CartPage = lazy(() => import('./pages/student/CartPage'));
const WishlistPage = lazy(() => import('./pages/student/WishlistPage'));
const CertificatesPage = lazy(() => import('./pages/student/CertificatesPage'));
const CategoriesPage = lazy(() => import('./pages/student/CategoriesPage'));

// Instructor
const InstructorLoginPage = lazy(() => import('./pages/instructor/InstructorLoginPage'));
const InstructorRegisterPage = lazy(() => import('./pages/instructor/InstructorRegisterPage'));
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const InstructorCourses = lazy(() => import('./pages/instructor/InstructorCourses'));
const CreateCoursePage = lazy(() => import('./pages/instructor/CreateCoursePage'));
const EditCoursePage = lazy(() => import('./pages/instructor/EditCoursePage'));
const InstructorCoupons = lazy(() => import('./pages/instructor/InstructorCoupons'));
const InstructorWithdrawals = lazy(() => import('./pages/instructor/InstructorWithdrawals'));
const InstructorReviews = lazy(() => import('./pages/instructor/InstructorReviews'));

// Admin
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminInstructors = lazy(() => import('./pages/admin/AdminInstructors'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/instructor/login" element={<InstructorLoginPage />} />
        <Route path="/instructor/register" element={<InstructorRegisterPage />} />
      </Route>

      {/* Admin login — standalone, no AuthLayout sidepanel */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Redirect /teach to instructor registration */}
      <Route path="/teach" element={<Navigate to="/instructor/register" replace />} />

      {/* Public + student routes */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/course/:slug" element={<CourseDetailPage />} />

        {/* Authenticated student */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
        </Route>
      </Route>

      {/* Learning page — full screen, no footer */}
      <Route element={<ProtectedRoute />}>
        <Route path="/learn/:courseId" element={<LearningPage />} />
      </Route>

      {/* Instructor dashboard */}
      <Route element={<ProtectedRoute roles={['instructor', 'admin']} />}>
        <Route path="/instructor" element={<DashboardLayout />}>
          <Route index element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="courses/new" element={<CreateCoursePage />} />
          <Route path="courses/:id/edit" element={<EditCoursePage />} />
          <Route path="coupons" element={<InstructorCoupons />} />
          <Route path="withdrawals" element={<InstructorWithdrawals />} />
          <Route path="reviews" element={<InstructorReviews />} />
        </Route>
      </Route>

      {/* Admin dashboard */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
);

export default App;
