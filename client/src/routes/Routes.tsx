import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import EmployeesPage from '../pages/EmployeesPage';
import ViewEmployeePage from '../pages/ViewEmployeePage';
import EditEmployeePage from '../pages/EditEmployeePage';

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/employees/view/:id" element={<ViewEmployeePage />} />
      <Route path="/employees/edit/:id" element={<EditEmployeePage />} />
    </Routes>
  </BrowserRouter>
);
  
export default AppRoutes;   