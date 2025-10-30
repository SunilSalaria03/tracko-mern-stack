import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";
import {
  SIDEBAR_MENU_ITEMS,
  SIDEBAR_BOTTOM_ITEMS,
  filterMenuByRole,
} from "../../../utils/constants/sidebarConfig";
import logo from "../../../assets/lnpinfotech_logo.jpg";

const Sidebar: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter menu items based on user role
  const sidebarMenu = useMemo(() => {
    return filterMenuByRole(SIDEBAR_MENU_ITEMS, user?.role);
  }, [user]);

  // Filter bottom items based on user role
  const sidebarBottomMenu = useMemo(() => {
    return filterMenuByRole(SIDEBAR_BOTTOM_ITEMS, user?.role);
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMenuClick = (path?: string) => {
    if (path && path !== "#") {
      navigate(path);
    }
  };

  const isActive = (path?: string) => {
    if (!path || path === "#") return false;
    return location.pathname === path;
  };

  return (
    <aside
      className={`${isSidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200 flex flex-col justify-between min-h-0 h-full transition-all duration-300 ease-in-out shadow-sm`}
    >
      <div>
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <button
            onClick={toggleSidebar}
            className={`w-6 h-6 rounded-md flex  hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 ${isSidebarCollapsed ? "mx-auto" : "ml-auto"}`}
          >
            {isSidebarCollapsed ? (
              <HiArrowSmLeft className="w-4 h-4" color="black" />
            ) : (
              <HiArrowSmRight className="w-4 h-4" color="black" />
            )}
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
                  isActive(item.path)
                    ? "bg-[#f5f6fa] font-semibold text-blue-600"
                    : ""
                } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                {item.icon ? (
                  item.icon
                ) : (
                  <img src={logo} alt="Logo" className="w-6 h-6" />
                )}
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          )}
        </nav>
      </div>

      <div className="mb-4 px-4">
        {sidebarBottomMenu.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleMenuClick(item.path)}
            className={`flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 w-full mb-2 px-2 py-2 rounded transition-all duration-200 ${isSidebarCollapsed ? "justify-center" : ""} ${
              isActive(item.path) ? "text-blue-600 bg-gray-50" : ""
            }`}
            title={isSidebarCollapsed ? item.label : undefined}
          >
            {item.icon}
            {!isSidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
