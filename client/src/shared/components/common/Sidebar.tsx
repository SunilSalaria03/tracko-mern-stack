import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineViewGrid, 
  HiOutlineSwitchHorizontal, 
  HiOutlineUserGroup, 
  HiOutlineDocumentText, 
  HiOutlineCog, 
  HiOutlineCube, 
  HiOutlineStar, 
  HiOutlineChartBar, 
  HiOutlineDatabase, 
  HiOutlinePuzzle, 
  HiChevronRight, 
  HiChevronLeft,
  HiOutlineUsers
} from 'react-icons/hi';

interface SidebarMenuItem {
  icon?: React.ReactNode;
  label: string;
  path?: string;
  divider?: boolean;
}

const sidebarMenu: SidebarMenuItem[] = [
  { icon: <HiOutlineViewGrid className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <HiOutlineUsers className="w-5 h-5" />, label: 'Employees', path: '/employees' },
  { icon: <HiOutlineSwitchHorizontal className="w-5 h-5" />, label: 'Process', path: '#' },
  { icon: <HiOutlineChartBar className="w-5 h-5" />, label: 'Sessions', path: '#' },
  { icon: <HiOutlineDatabase className="w-5 h-5" />, label: 'Environments', path: '#' },
  { icon: <HiOutlineUserGroup className="w-5 h-5" />, label: 'Collaboration', path: '#' },
  { icon: <HiOutlineDocumentText className="w-5 h-5" />, label: 'Logs', path: '#' },
  { icon: <HiOutlineCube className="w-5 h-5" />, label: 'Marketplace', path: '#' },
  { divider: true, label: '' },
  { icon: <HiOutlinePuzzle className="w-5 h-5" />, label: 'Ext. Modules', path: '#' },
  { icon: <HiOutlineStar className="w-5 h-5" />, label: 'Billing', path: '#' },
];

const Sidebar: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMenuClick = (path?: string) => {
    if (path && path !== '#') {
      navigate(path);
    }
  };

  const isActive = (path?: string) => {
    if (!path || path === '#') return false;
    return location.pathname === path;
  };

  return (
    <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col justify-between min-h-0 h-full transition-all duration-300 ease-in-out shadow-sm`}>
      <div>
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <span className="block w-7 h-7 bg-blue-600 rounded-full flex-shrink-0" />
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-gray-500 leading-none">Tracko</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`ml-auto w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 ${isSidebarCollapsed ? 'mx-auto' : ''}`}
          >
            {isSidebarCollapsed ? <HiChevronRight className="w-4 h-4" /> : <HiChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        
        <nav className="mt-2">
          {sidebarMenu.map((item, idx) =>
            item.divider ? (
              <hr key={idx} className="my-2 border-gray-200" />
            ) : (
              <button
                key={item.label}
                onClick={() => handleMenuClick(item.path)}
                className={`flex items-center gap-3 w-full px-5 py-2 text-gray-700 hover:bg-[#f5f6fa] rounded transition-all duration-200 text-sm ${
                  isActive(item.path) ? 'bg-[#f5f6fa] font-semibold text-blue-600' : ''
                } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          )}
        </nav>
      </div>
      
      <div className="mb-4 px-4">
        <button 
          className={`flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 w-full mb-2 px-2 py-2 rounded transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title={isSidebarCollapsed ? 'Settings' : undefined}
        >
          <HiOutlineCog className="w-5 h-5" />
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>
        <button 
          className={`flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 w-full px-2 py-2 rounded transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
          title={isSidebarCollapsed ? 'View Grid' : undefined}
        >
          <HiOutlineViewGrid className="w-5 h-5" />
          {!isSidebarCollapsed && <span>View Grid</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

