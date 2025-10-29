import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, Outlet } from "react-router-dom";
import { selectAppState } from "../store/selectors";
import Navbar from "../shared/components/common/Navbar";
import Sidebar from "../shared/components/common/Sidebar";

const MainLayout: React.FC = () => {
  const { authUser: user } = useSelector(selectAppState);
  const location = useLocation();

  const hasSidebar = user?.role === 0 || user?.role === 2; // 0: admin, 2: moderator

  if (hasSidebar) {
    return (
      <div className="flex flex-col min-h-screen h-screen bg-[#fafbfc] overflow-hidden">
        <Navbar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <main className="flex-1 min-h-0 h-full p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc]">
      <Navbar />

      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex gap-6">
          <Link
            to="/welcome"
            className={`text-sm font-medium transition-colors ${
              location.pathname === "/welcome"
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Welcome
          </Link>
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors ${
              location.pathname === "/dashboard"
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>

      <main className="flex-1 p-8"><Outlet /></main>
    </div>
  );
};

export default MainLayout;
