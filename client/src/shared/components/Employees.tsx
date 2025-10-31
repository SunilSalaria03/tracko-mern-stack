import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  Avatar,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchEmployees, updateEmployee, createEmployee } from '../../store/actions/employeeActions';
import type { Employee } from '../../utils/interfaces/employeeInterface';
import { toast } from 'react-toastify';

interface EmployeeFormData {
  name: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  countryCode?: string;
  role: 0 | 1 | 2;
  status: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

const Employees = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { employees, total, isLoading, error } = useAppSelector(
    (state) => state.employee
  );
  console.log("employees", employees);

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    countryCode: '+1',
    role: 1,
    status: 1,
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch employees when filters change
  const loadEmployees = useCallback(() => {
    dispatch(
      fetchEmployees({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
      sortBy,
        sortOrder,
      })
    );
  }, [dispatch, page, rowsPerPage, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!isEdit && !formData.password) {
      errors.password = 'Password is required';
    } else if (!isEdit && formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setIsEdit(false);
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      countryCode: '+1',
      role: 1,
      status: 1,
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setFormErrors({});
    setOpenFormModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (employee: Employee) => {
    setIsEdit(true);
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email,
      phoneNumber: employee.phoneNumber || '',
      countryCode: employee.countryCode || '+1',
      role: employee.role,
      status: employee.status,
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      zipCode: employee.zipCode || '',
    });
    setFormErrors({});
    setOpenFormModal(true);
  };

  // Close form modal
  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      countryCode: '+1',
      role: 1,
      status: 1,
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setFormErrors({});
  };

  // Handle form change
  const handleFormChange = (
    field: keyof EmployeeFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEdit && selectedEmployee) {
        const updateData: any = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          countryCode: formData.countryCode,
          role: formData.role,
          status: formData.status,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        };
        
        await dispatch(
          updateEmployee({
            id: selectedEmployee._id,
            data: updateData,
          })
        ).unwrap();
        toast.success('Employee updated successfully!');
      } else {
        const createData = {
          ...formData,
          password: formData.password!,
        };
        await dispatch(createEmployee(createData)).unwrap();
        toast.success('Employee created successfully!');
      }
      handleCloseFormModal();
    } catch (err) {
      toast.error(
        isEdit ? 'Failed to update employee' : 'Failed to create employee'
      );
    }
  };

  const handleViewClick = (employee: Employee) => {
    navigate(`/employees/view/${employee._id}`);
  };

  const handleStatusToggle = async (employee: Employee) => {
    try {
      const newStatus = employee.status === 1 ? 0 : 1;
      await dispatch(
        updateEmployee({
        id: employee._id,
          data: { status: newStatus },
        })
      ).unwrap();
      toast.success('Status updated successfully!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 0:
        return 'Admin';
      case 1:
        return 'Employee';
      case 2:
        return 'Moderator';
      default:
        return 'Unknown';
    }
  };

  const getRoleColor = (
    role: number
  ): 'primary' | 'secondary' | 'success' | 'error' | 'warning' => {
    switch (role) {
      case 0:
        return 'secondary';
      case 1:
        return 'primary';
      case 2:
        return 'success';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  // Calculate statistics
  const activeCount = employees?.filter((e) => e.status === 1).length;
  const adminCount = employees?.filter((e) => e.role === 0).length;

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}
          >
            Employee Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Manage your team members and their access
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{
            bgcolor: '#10b981',
            color: 'white',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#059669',
            },
          }}
        >
              Add Employee
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha('#3b82f6', 0.1),
                  borderRadius: 2,
                }}
              >
                <GroupIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  Total Employees
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: '#1f2937' }}
                >
                  {total || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha('#10b981', 0.1),
                  borderRadius: 2,
                }}
              >
                <PersonIcon sx={{ color: '#10b981', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  Active Employees
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: '#1f2937' }}
                >
                  {activeCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha('#8b5cf6', 0.1),
                  borderRadius: 2,
                }}
              >
                <AdminIcon sx={{ color: '#8b5cf6', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  Administrators
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: '#1f2937' }}
                >
                  {adminCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={0} sx={{ mb: 2, p: 2, border: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search employees by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ color: '#6b7280' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
              },
            }}
          />
          <TextField
            select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="createdAt">Date Added</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="role">Role</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            sx={{
              minWidth: 100,
              borderColor: '#e5e7eb',
              color: '#6b7280',
            }}
                >
                  {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!isLoading && error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!isLoading && !error && employees.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
            }}
          >
            <GroupIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#9ca3af', mb: 1 }}>
              No employees found
            </Typography>
            <Typography variant="body2" sx={{ color: '#d1d5db', mb: 3 }}>
                    {searchTerm
                ? 'Try adjusting your search terms'
                : "Click 'Add Employee' to add your first team member"}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal}
                sx={{
                  bgcolor: '#10b981',
                  color: 'white',
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#059669',
                  },
                }}
              >
                Add Employee
              </Button>
            )}
          </Box>
        )}

        {!isLoading && !error && employees.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Employee
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Date Added
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Status
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: '#374151' }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow
                      key={employee._id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha('#3b82f6', 0.05),
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: '#3b82f6',
                              width: 40,
                              height: 40,
                              fontWeight: 600,
                            }}
                          >
                                {employee.name?.charAt(0).toUpperCase() || 'E'}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: '#1f2937' }}
                            >
                                {employee.name || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                        {employee.email}
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                            {employee.phoneNumber
                              ? `${employee.countryCode || ''} ${employee.phoneNumber}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleName(employee.role)}
                          size="small"
                          color={getRoleColor(employee.role)}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                          {formatDate(employee.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={employee.status === 1}
                              onChange={() => handleStatusToggle(employee)}
                              size="small"
                              color="success"
                            />
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {employee.status === 1 ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Employee">
                            <IconButton
                              size="small"
                              onClick={() => handleViewClick(employee)}
                              sx={{
                                color: '#6b7280',
                                '&:hover': {
                                  color: '#3b82f6',
                                  bgcolor: alpha('#3b82f6', 0.1),
                                },
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Employee">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(employee)}
                              sx={{
                                color: '#6b7280',
                                '&:hover': {
                                  color: '#10b981',
                                  bgcolor: alpha('#10b981', 0.1),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid #e5e7eb',
              }}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Form Modal */}
      <Dialog
        open={openFormModal}
        onClose={handleCloseFormModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid #e5e7eb',
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Name */}
            <TextField
              label="Full Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              placeholder="Enter employee name"
            />

            {/* Email */}
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              placeholder="employee@example.com"
              disabled={isEdit}
            />

            {/* Password (only for create) */}
            {!isEdit && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password}
                placeholder="Enter password (min 6 characters)"
              />
            )}

            {/* Phone */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Country Code"
                value={formData.countryCode}
                onChange={(e) => handleFormChange('countryCode', e.target.value)}
                sx={{ width: 120 }}
              >
                <MenuItem value="+1">+1 (US)</MenuItem>
                <MenuItem value="+44">+44 (UK)</MenuItem>
                <MenuItem value="+91">+91 (IN)</MenuItem>
              </TextField>
              <TextField
                label="Phone Number"
                fullWidth
                value={formData.phoneNumber}
                onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                placeholder="1234567890"
              />
            </Box>

            {/* Role and Status */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Role"
                fullWidth
                required
                value={formData.role}
                onChange={(e) => handleFormChange('role', parseInt(e.target.value) as 0 | 1 | 2)}
              >
                <MenuItem value={0}>Admin</MenuItem>
                <MenuItem value={1}>Employee</MenuItem>
                <MenuItem value={2}>Moderator</MenuItem>
              </TextField>

              <TextField
                select
                label="Status"
                fullWidth
                required
                value={formData.status}
                onChange={(e) => handleFormChange('status', parseInt(e.target.value))}
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </TextField>
            </Box>

            {/* Address */}
            <TextField
              label="Address"
              fullWidth
              value={formData.address}
              onChange={(e) => handleFormChange('address', e.target.value)}
              placeholder="Street address"
            />

            {/* City, State, Zip */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="City"
                fullWidth
                value={formData.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
                placeholder="City"
              />
              <TextField
                label="State"
                fullWidth
                value={formData.state}
                onChange={(e) => handleFormChange('state', e.target.value)}
                placeholder="State"
              />
              <TextField
                label="Zip Code"
                fullWidth
                value={formData.zipCode}
                onChange={(e) => handleFormChange('zipCode', e.target.value)}
                placeholder="12345"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: '1px solid #e5e7eb',
            px: 3,
            py: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseFormModal}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: '#e5e7eb',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#9ca3af',
                bgcolor: alpha('#6b7280', 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
              '&:disabled': {
                bgcolor: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : isEdit ? (
              'Update Employee'
            ) : (
              'Create Employee'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;
