import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';

const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../../pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../../pages/user/DashboardPage'));
const TimeTrackPage = lazy(() => import('../../pages/user/TimeTrackPage'));
const ProfilePage = lazy(() => import('../../pages/common/ProfilePage'));
const EmployeesPage = lazy(() => import('../../pages/common/EmployeesPage'));
const ViewEmployeePage = lazy(() => import('../../pages/common/ViewEmployeePage'));
const EditEmployeePage = lazy(() => import('../../pages/common/EditEmployeePage'));
const WelcomePage = lazy(() => import('../../pages/user/WelcomePage'));
const ProtectedRoute = lazy(() => import('../components/common/ProtectedRoutes'));

const AppRoutes: React.FC = () => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>}>
      <Routes>
        {/* Auth Routes - No Layout */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes with Layout */}
        <Route element={<ProtectedRoute requiredRole={1} />}>
          <Route element={<MainLayout />}>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/time" element={<TimeTrackPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin Routes with Layout (add requiredRole for admin) */}
        <Route element={<ProtectedRoute requiredRole={0} />}>
          <Route element={<MainLayout />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/view/:id" element={<ViewEmployeePage />} />
            <Route path="/employees/edit/:id" element={<EditEmployeePage />} />
          </Route>
        </Route>

        {/* You can add more role-based routes here */}
        {/* For routes accessible to multiple roles */}
        {/* <Route element={<ProtectedRoute requiredRole={[0, 1, 2]} />}>
          <Route element={<MainLayout />}>
            <Route path="/common-page" element={<CommonPage />} />
          </Route>
        </Route> */}
      </Routes>
    </Suspense>
  </BrowserRouter>
);
  
export default AppRoutes;   