import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { Alert, CircularProgress } from '@mui/material';
import Navbar from '../../shared/components/common/Navbar';
import Sidebar from '../../shared/components/common/Sidebar';
import { useAppDispatch } from '../../store';
import { updateEmployee } from '../../store/actions/employeeActions';
import { apiClient } from '../../store/apiClient';
import { API_ENDPOINTS } from '../../store/apiEndpoints';
import type { Employee } from '../../utils/interfaces/employeeInterface';

interface EditFormData {
  name: string;
  phoneNumber: string;
  countryCode: string;
  role: 0 | 1 | 2;
  status: 0 | 1;
}

interface FieldErrors {
  name?: string;
  phoneNumber?: string;
}

const EditEmployeePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    phoneNumber: '',
    countryCode: '+1',
    role: 1,
    status: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      
      try {
        const response = await apiClient.get<Employee>(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
        if (response.success) {
          const emp = (response.body || response.data) as Employee;
          setEmployee(emp);
          setFormData({
            name: emp.name || '',
            phoneNumber: emp.phoneNumber || '',
            countryCode: emp.countryCode || '+1',
            role: emp.role,
            status: emp.status || 1,
          });
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'phoneNumber':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\d{10,15}$/.test(value.trim())) return 'Phone number must be 10-15 digits';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' || name === 'status' ? parseInt(value) : value,
    }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    const nameError = validateField('name', formData.name);
    if (nameError) {
      errors.name = nameError;
      isValid = false;
    }

    const phoneError = validateField('phoneNumber', formData.phoneNumber);
    if (phoneError) {
      errors.phoneNumber = phoneError;
      isValid = false;
    }

    setFieldErrors(errors);
    setTouched({ name: true, phoneNumber: true });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    if (!employee || !id) return;

    setSaving(true);

    try {
      await dispatch(updateEmployee({
        id: id,
        data: {
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          countryCode: formData.countryCode,
          role: formData.role,
          status: formData.status,
        }
      })).unwrap();
      
      navigate('/employees');
    } catch (err: any) {
      setError(err || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen h-screen bg-[#fafbfc] overflow-hidden">
        <Navbar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <main className="flex-1 min-h-0 h-full p-8 overflow-auto">
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
          <main className="flex-1 min-h-0 h-full p-8 overflow-auto">
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
        <main className="flex-1 min-h-0 h-full p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/employees')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={saving}
              >
                <HiArrowLeft className="w-5 h-5" />
                Back to Employees
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Employee</h1>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={saving}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        touched.name && fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {touched.name && fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={employee.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Phone Number */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country Code <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="+1">+1 (USA/Canada)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+91">+91 (India)</option>
                        <option value="+61">+61 (Australia)</option>
                        <option value="+81">+81 (Japan)</option>
                        <option value="+86">+86 (China)</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={saving}
                        placeholder="Enter phone number (digits only)"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          touched.phoneNumber && fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {touched.phoneNumber && fieldErrors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Employee</option>
                      <option value={2}>Moderator</option>
                      <option value={0}>Admin</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/employees')}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <CircularProgress size={20} color="inherit" />}
                    {saving ? 'Updating...' : 'Update Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditEmployeePage;

