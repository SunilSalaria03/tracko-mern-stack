import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HiArrowLeft, HiOutlineMail, HiOutlinePhone, HiOutlineCake, HiOutlineCalendar } from 'react-icons/hi';
import Navbar from '../../shared/components/common/Navbar';
import Sidebar from '../../shared/components/common/Sidebar';
import { useAppDispatch } from '../../store';
import { apiClient } from '../../store/apiClient';
import { API_ENDPOINTS } from '../../store/apiEndpoints';
import type { Employee } from '../../utils/interfaces/employeeInterface';

const ViewEmployeePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      
      try {
        const response = await apiClient.get<Employee>(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
        if (response.success) {
          setEmployee((response.body || response.data) as Employee);
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: return 'Admin';
      case 1: return 'Employee';
      case 2: return 'Moderator';
      default: return 'Unknown';
    }
  };

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case 0: return 'bg-purple-100 text-purple-800';
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen h-screen bg-[#fafbfc] overflow-hidden">
        <Navbar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <main className="flex-1 min-h-0 h-full p-5 overflow-auto">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col min-h-screen h-screen bg-[#fafbfc] overflow-hidden">
        <Navbar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <main className="flex-1 min-h-0 h-full p-5 overflow-auto">
            <div className="text-center">
              <p className="text-gray-500">Employee not found</p>
              <button
                onClick={() => navigate('/employees')}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Back to Employees
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen h-screen bg-[#fafbfc] overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-h-0 h-full p-5 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/employees')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <HiArrowLeft className="w-5 h-5" />
                Back to Employees
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-3xl shadow-lg">
                    {employee.name?.charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(employee.role)} bg-white`}>
                        {getRoleName(employee.role)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        employee.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Details */}
              <div className="p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <HiOutlineMail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="text-gray-900 font-medium">{employee.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <HiOutlinePhone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="text-gray-900 font-medium">
                        {employee.phoneNumber
                          ? `${employee.countryCode || ''} ${employee.phoneNumber}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {employee.dateOfBirth && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <HiOutlineCake className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                        <p className="text-gray-900 font-medium">{formatDate(employee.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">System Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <HiOutlineCalendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Date Added</p>
                        <p className="text-gray-900 font-medium">{formatDate(employee.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-pink-50 rounded-lg">
                        <HiOutlineCalendar className="w-6 h-6 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                        <p className="text-gray-900 font-medium">{formatDate(employee.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => navigate('/employees')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate(`/employees/edit/${employee._id}`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewEmployeePage;

