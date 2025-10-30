import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import { fetchEmployees } from '../../../store/actions/employeeActions';
import { fetchProjects } from '../../../store/actions/projectActions';
import { getRoleName } from '../../../utils/interfaces/userInterface';
import { 
  HiOutlineUsers, 
  HiOutlineBriefcase, 
  HiOutlineCheckCircle, 
  HiOutlineClock,
  HiOutlineTrendingUp,
  HiOutlineUserGroup
} from 'react-icons/hi';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, total: totalEmployees } = useSelector((state: RootState) => state.employee);
  const { projects, total: totalProjects } = useSelector((state: RootState) => state.project);
  const { user } = useSelector((state: RootState) => state.auth);

  const [roleDistribution, setRoleDistribution] = useState({ admin: 0, hr: 0, pm: 0, employee: 0 });

  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 1000 }));
    dispatch(fetchProjects({ page: 1, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    const distribution = { admin: 0, hr: 0, pm: 0, employee: 0 };
    employees.forEach(emp => {
      if (emp.role === 0) distribution.admin++;
      else if (emp.role === 1) distribution.hr++;
      else if (emp.role === 2) distribution.pm++;
      else if (emp.role === 4) distribution.employee++;
    });
    setRoleDistribution(distribution);
  }, [employees]);

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Management Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'} ({user?.role !== undefined ? getRoleName(user.role) : 'User'})</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700 transition-colors">
            View Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <HiOutlineUsers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-200 px-2 py-1 rounded">
              Total
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Employees</h3>
          <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
          <p className="text-xs text-gray-500 mt-2">
            Active workforce members
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <HiOutlineBriefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-200 px-2 py-1 rounded">
              All
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Projects</h3>
          <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
          <p className="text-xs text-gray-500 mt-2">
            Across all statuses
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-green-600 rounded-lg">
              <HiOutlineClock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-200 px-2 py-1 rounded">
              Active
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Projects</h3>
          <p className="text-3xl font-bold text-gray-900">{activeProjects}</p>
          <p className="text-xs text-gray-500 mt-2">
            Currently in progress
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-amber-600 rounded-lg">
              <HiOutlineCheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-200 px-2 py-1 rounded">
              {completionRate}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Completed Projects</h3>
          <p className="text-3xl font-bold text-gray-900">{completedProjects}</p>
          <p className="text-xs text-gray-500 mt-2">
            Successfully delivered
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Project Status Overview</h3>
            <HiOutlineTrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <span className="text-sm font-semibold text-green-600">{activeProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completed</span>
                <span className="text-sm font-semibold text-blue-600">{completedProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">On Hold</span>
                <span className="text-sm font-semibold text-amber-600">{onHoldProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalProjects > 0 ? (onHoldProjects / totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Project Completion Rate</span>
              <span className="font-bold text-lg text-blue-600">{completionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Team Composition</h3>
            <HiOutlineUserGroup className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <HiOutlineUsers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Super Administrators</p>
                  <p className="text-xs text-gray-500">Full system access</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{roleDistribution.admin}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <HiOutlineBriefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Admin & Managers</p>
                  <p className="text-xs text-gray-500">Management roles</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{roleDistribution.hr + roleDistribution.pm}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <HiOutlineUserGroup className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Employees</p>
                  <p className="text-xs text-gray-500">Team members</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{roleDistribution.employee}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Workforce</p>
                <p className="text-xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Management</p>
                <p className="text-xl font-bold text-gray-900">{roleDistribution.admin + roleDistribution.hr + roleDistribution.pm}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg. Team Size</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalProjects > 0 ? Math.round(totalEmployees / totalProjects) : 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Projects per PM</p>
            <p className="text-2xl font-bold text-gray-900">
              {roleDistribution.hr > 0 ? Math.round(totalProjects / roleDistribution.hr) : totalProjects}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Active Resources</p>
            <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

