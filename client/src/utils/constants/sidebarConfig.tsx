import React from 'react';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineCog,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineCollection,
  HiOutlineIdentification,
 } from 'react-icons/hi';
import type { UserRole } from '../interfaces/userInterface';

export interface SidebarMenuItem {
  icon?: React.ReactNode;
  label: string;
  path?: string;
  divider?: boolean;
  roles: UserRole[];
}

export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  {
    icon: <HiOutlineViewGrid className="w-5 h-5" />,
    label: 'Dashboard',
    path: '/dashboard',
    roles: [0, 1, 2, 3],
  },
   {
    icon: <HiOutlineHome className="w-5 h-5" />,
    label: 'Welcome',
    path: '/welcome',
    roles: [3],
  },
  {
    icon: <HiOutlineClock className="w-5 h-5" />,
    label: 'Time Tracking',
    path: '/time',
    roles: [3],
  },
   {
    divider: true,
    label: '',
    roles: [0, 1, 2],
  },
   {
    icon: <HiOutlineUsers className="w-5 h-5" />,
    label: 'Employees',
    path: '/users',
    roles: [1,2], 
  },
  {
    icon: <HiOutlineBriefcase className="w-5 h-5" />,
    label: 'Projects',
    path: '/projects',
    roles: [1, 2], 
  },
  {
    icon: <HiOutlineCollection className="w-5 h-5" />,
    label: 'Workstreams',
    path: '/workstreams',
    roles: [1, 2], 
  },
  {
    icon: <HiOutlineUserGroup className="w-5 h-5" />,
    label: 'Departments',
    path: '/departments',
    roles: [0, 1,], 
  },
  {
    icon: <HiOutlineIdentification className="w-5 h-5" />,
    label: 'Designations',
    path: '/designations',
    roles: [0, 1, ], 
  },
   {
    divider: true,
    label: '',
    roles: [0],
  },
  {
    icon: <HiOutlineUserGroup className="w-5 h-5" />,
    label: 'Admin Management',
    path: '/admins',
    roles: [0],  
  },
  {
    icon: <HiOutlineShieldCheck className="w-5 h-5" />,
    label: 'Roles & Permissions',
    path: '/roles-permissions',
    roles: [0],  
  },
];

export const SIDEBAR_BOTTOM_ITEMS: SidebarMenuItem[] = [
  {
    icon: <HiOutlineCog className="w-5 h-5" />,
    label: 'Settings',
    path: '/settings',
    roles: [0, 1, 2, 3],
  },
];

export const filterMenuByRole = (items: SidebarMenuItem[], userRole: UserRole | undefined): SidebarMenuItem[] => {
  if (!userRole && userRole !== 0) return [];
  return items.filter(item => item.roles.includes(userRole));
};

