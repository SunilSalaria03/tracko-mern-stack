import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { getRoleName } from '../../../utils/interfaces/userInterface';
import {
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
} from 'react-icons/hi';

const ManagementWelcome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const quickActions = [
    {
      icon: <HiOutlineUsers className="w-8 h-8" />,
      title: 'Manage Employees',
      description: 'View, add, or edit employee information',
      path: '/employees',
      color: 'blue',
      roles: [0, 1, 2],
    },
    {
      icon: <HiOutlineBriefcase className="w-8 h-8" />,
      title: 'Projects',
      description: 'Create and manage project assignments',
      path: '/projects',
      color: 'purple',
      roles: [0, 1, 2],
    },
    {
      icon: <HiOutlineChartBar className="w-8 h-8" />,
      title: 'Analytics',
      description: 'View reports and performance metrics',
      path: '/analytics',
      color: 'green',
      roles: [0, 1],
    },
    {
      icon: <HiOutlineUserGroup className="w-8 h-8" />,
      title: 'User Management',
      description: 'Manage system users and permissions',
      path: '/user-management',
      color: 'amber',
      roles: [0],
    },
  ];

  const gettingStarted = [
    {
      icon: <HiOutlineCheckCircle className="w-6 h-6" />,
      title: 'Set up your team',
      description: 'Add employees and assign them to projects',
    },
    {
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      title: 'Create projects',
      description: 'Set up projects and define milestones',
    },
    {
      icon: <HiOutlineChartBar className="w-6 h-6" />,
      title: 'Monitor progress',
      description: 'Track team productivity and project status',
    },
    {
      icon: <HiOutlineCog className="w-6 h-6" />,
      title: 'Customize settings',
      description: 'Configure system preferences and workflows',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'bg-blue-600',
        hover: 'hover:border-blue-400',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'bg-purple-600',
        hover: 'hover:border-purple-400',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'bg-green-600',
        hover: 'hover:border-green-400',
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'bg-amber-600',
        hover: 'hover:border-amber-400',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const filteredQuickActions = quickActions.filter(
    action => user && action.roles.includes(user.role)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {user && getRoleName(user.role)} Dashboard
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          Go to Dashboard
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredQuickActions.map((action, index) => {
            const colorClasses = getColorClasses(action.color);
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover} rounded-xl border-2 p-6 text-left hover:shadow-md transition-all duration-200 cursor-pointer`}
              >
                <div className={`${colorClasses.icon} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <HiOutlineShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Getting Started</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gettingStarted.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 p-2 bg-white rounded-lg h-fit">
                <div className="text-blue-600">{item.icon}</div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <HiOutlineUsers className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Team Management</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">Active</p>
          <p className="text-xs text-gray-600">
            Manage your team members and their roles
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <HiOutlineBriefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Project Tracking</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">Running</p>
          <p className="text-xs text-gray-600">
            Monitor all active projects and deadlines
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-600 rounded-lg">
              <HiOutlineChartBar className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Performance</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">Optimal</p>
          <p className="text-xs text-gray-600">
            Track team productivity and efficiency
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagementWelcome;

