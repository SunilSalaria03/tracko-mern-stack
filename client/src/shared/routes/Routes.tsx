import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";

const LoginPage = lazy(() => import("../../pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("../../pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(
  () => import("../../pages/auth/ResetPasswordPage")
);

const ManagementDashboardPage = lazy(
  () => import("../../pages/common/DashboardPage")
);
const ManagementWelcomePage = lazy(
  () => import("../../pages/common/WelcomePage")
);
const EmployeesPage = lazy(() => import("../../pages/common/EmployeesPage"));
const ViewEmployeePage = lazy(
  () => import("../../pages/common/ViewEmployeePage")
);
const EditEmployeePage = lazy(
  () => import("../../pages/common/EditEmployeePage")
);
const ProjectsPage = lazy(() => import("../../pages/admin/ProjectsPage"));
const UsersPage = lazy(() => import("../../pages/admin/UsersPage"));
const WorkstreamsPage = lazy(() => import("../../pages/admin/WorkstreamsPage"));
const AdminsPage = lazy(() => import("../../pages/superadmin/AdminsPage"));

const EmployeeDashboardPage = lazy(
  () => import("../../pages/user/DashboardPage")
);
const EmployeeWelcomePage = lazy(() => import("../../pages/user/WelcomePage"));
const TimeTrackPage = lazy(() => import("../../pages/user/TimeTrackPage"));

const ProfilePage = lazy(() => import("../../pages/common/ProfilePage"));
const AccountSettingPage = lazy(() => import("../../pages/common/AccountSettingPage"));

const ProtectedRoute = lazy(
  () => import("../components/common/ProtectedRoutes")
);

const AppRoutes: React.FC = () => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute requiredRole={[0]} />}>
          <Route element={<MainLayout />}>
            <Route path="/admins" element={<AdminsPage />} />
          </Route>
        </Route>


        <Route element={<ProtectedRoute requiredRole={[0, 1, 2, 3]} />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<AccountSettingPage />} />
          </Route>
        </Route>



        <Route element={<ProtectedRoute requiredRole={[0, 1, 2]} />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<ManagementWelcomePage />} />
            <Route path="/dashboard" element={<ManagementDashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/view/:id" element={<ViewEmployeePage />} />
            <Route path="/employees/edit/:id" element={<EditEmployeePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/workstreams" element={<WorkstreamsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole={[3]} />}>
          <Route element={<MainLayout />}>
            <Route path="/welcome" element={<EmployeeWelcomePage />} />
            <Route
              path="/employee-dashboard"
              element={<EmployeeDashboardPage />}
            />
            <Route path="/time" element={<TimeTrackPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRoutes;
