import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../shared/components/common/Navbar";
import Sidebar from "../shared/components/common/Sidebar";
import { isManagementRole, isEmployeeRole } from "../utils/constants/roles";

const MainLayout: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();
console.log(user);
  const hasManagementLayout = user?.role !== undefined && isManagementRole(user.role);
  const hasEmployeeLayout = user?.role !== undefined && isEmployeeRole(user.role);

  if (hasManagementLayout) {
    return (
      <div className="flex flex-col min-h-screen h-screen bg-[#fafbfc] overflow-hidden">
        <Navbar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <main className="flex-1 min-h-0 h-full p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    );
  }

  if (hasEmployeeLayout) {
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
              to="/employee-dashboard"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/employee-dashboard"
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/time"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/time"
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Time Tracking
            </Link>
          </div>
        </div>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc]">
      <Navbar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default MainLayout;
