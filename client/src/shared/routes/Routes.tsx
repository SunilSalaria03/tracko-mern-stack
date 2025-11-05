import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import DesignationsPage from "../../pages/admin/DesignationsPage";
import PageNotFound from "../components/common/PageNotFound";

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
 
const ProjectsPage = lazy(() => import("../../pages/admin/ProjectsPage"));
const UsersPage = lazy(() => import("../../pages/admin/UsersPage"));
const WorkstreamsPage = lazy(() => import("../../pages/admin/WorkstreamsPage"));
const AdminsPage = lazy(() => import("../../pages/superadmin/AdminsPage"));
const DepartmentsPage = lazy(() => import("../../pages/admin/DepartmentsPage"));

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
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/workstreams" element={<WorkstreamsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/designations" element={<DesignationsPage />} />
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
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRoutes;
