import { useState, useEffect } from "react";
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
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../../../store/actions/adminActions";
import type {
  Admin,
  AdminFormData,
} from "../../../../utils/interfaces/adminInterface";
import { ROLES, ROLE_NAMES } from "../../../../utils/constants/roles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/**
 * Admin Management Component
 * 
 * This component is ONLY accessible by Super Admin (role 0).
 * It allows Super Admin to manage Admins, Managers, and other Super Admins.
 * 
 * Features:
 * - Create new admins with specific roles (Super Admin, Admin, Manager)
 * - Update existing admin information
 * - Delete admins
 * - Filter and search admins by role, status, name, or email
 * - View admin details including designation and department
 */
const AdminManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { admins, total, isLoading, error } =
    useAppSelector((state) => state.adminManagement);
  const { user } = useAppSelector((state) => state.auth);

  // Permission check - Only Super Admin (role 0) can access
  useEffect(() => {
    if (user && user.role !== ROLES.SUPER_ADMIN) {
      toast.error("Access denied. Only Super Admin can manage admins.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<0 | 1 | 2 | "">("");
  const [statusFilter, setStatusFilter] = useState<0 | 1 | "">("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AdminFormData>({
    role: 1,
    email: "",
    name: "",
    phoneNumber: "",
    countryCode: "+1",
    designation: "",
    department: "",
    status: 1,
    password: "",
    dateOfBirth: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch admins when filters change
  useEffect(() => {
    dispatch(
      fetchAdmins({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        role: roleFilter === "" ? undefined : roleFilter,
        status: statusFilter === "" ? undefined : statusFilter,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  }, [dispatch, page, rowsPerPage, debouncedSearch, roleFilter, statusFilter]);

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

  // Reset form
  const resetForm = () => {
    setFormData({
      role: 1,
      email: "",
      name: "",
      phoneNumber: "",
      countryCode: "+1",
      designation: "",
      department: "",
      status: 1,
      password: "",
      dateOfBirth: "",
    });
    setFormErrors({});
    setShowPassword(false);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    setIsEdit(false);
    setSelectedAdmin(null);
    setOpenFormModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      role: admin.role,
      email: admin.email,
      name: admin.name,
      phoneNumber: admin.phoneNumber,
      countryCode: admin.countryCode,
      designation: admin.designation,
      department: admin.department,
      status: admin.status,
      dateOfBirth: admin.dateOfBirth || "",
    });
    setIsEdit(true);
    setOpenFormModal(true);
  };

  // Close form modal
  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    resetForm();
    setSelectedAdmin(null);
  };

  // Open delete modal
  const handleOpenDeleteModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setOpenDeleteModal(true);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedAdmin(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 10 digits";
    }

    if (!formData.designation.trim()) {
      errors.designation = "Designation is required";
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required";
    }

    if (!isEdit && !formData.password) {
      errors.password = "Password is required";
    }

    if (!isEdit && formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEdit && selectedAdmin) {
        await dispatch(
          updateAdmin({
            id: selectedAdmin._id,
            data: formData,
          })
        ).unwrap();
        toast.success("Admin updated successfully");
      } else {
        await dispatch(
          createAdmin({
            ...formData,
            password: formData.password!,
          })
        ).unwrap();
        toast.success("Admin created successfully");
      }
      handleCloseFormModal();
      dispatch(
        fetchAdmins({
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
          role: roleFilter === "" ? undefined : roleFilter,
          status: statusFilter === "" ? undefined : statusFilter,
          sortBy: "createdAt",
          sortOrder: "desc",
        })
      );
    } catch (error: any) {
      toast.error(error || "Operation failed");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedAdmin) return;

    try {
      await dispatch(deleteAdmin(selectedAdmin._id)).unwrap();
      toast.success("Admin deleted successfully");
      handleCloseDeleteModal();
      dispatch(
        fetchAdmins({
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
          role: roleFilter === "" ? undefined : roleFilter,
          status: statusFilter === "" ? undefined : statusFilter,
          sortBy: "createdAt",
          sortOrder: "desc",
        })
      );
    } catch (error: any) {
      toast.error(error || "Delete failed");
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof AdminFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Get role chip color
  const getRoleChipColor = (role: number) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return "error";
      case ROLES.ADMIN:
        return "warning";
      case ROLES.MANAGER:
        return "info";
      default:
        return "default";
    }
  };

  // Get status chip
  const getStatusChip = (status: number) => {
    return status === 1 ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Inactive" color="default" size="small" />
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: "#1f2937", mb: 1 }}
          >
            Admin Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Manage administrators, managers, and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          sx={{
            bgcolor: "#10b981",
            color: "white",
            textTransform: "none",
            px: 3,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#059669",
            },
          }}
        >
          Add Admin
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#6b7280" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm("")}
                    sx={{ color: "#6b7280" }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label="Role Filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as 0 | 1 | 2 | "");
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value={ROLES.SUPER_ADMIN}>Super Admin</MenuItem>
              <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
              <MenuItem value={ROLES.MANAGER}>Manager</MenuItem>
            </TextField>
            <TextField
              select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 0 | 1 | "");
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Inactive</MenuItem>
            </TextField>
          </Box>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
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

        {!isLoading && !error && admins.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No admins found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "Click 'Add Admin' to create your first admin"}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateModal}
                sx={{
                  bgcolor: "#10b981",
                  color: "white",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "#059669",
                  },
                }}
              >
                Add Admin
              </Button>
            )}
          </Box>
        )}

        {!isLoading && !error && admins.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Designation
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Status
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "#374151" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow
                      key={admin._id}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha("#3b82f6", 0.05),
                        },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1f2937" }}
                        >
                          {admin.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {admin.email}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ROLE_NAMES[admin.role]}
                          color={getRoleChipColor(admin.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {admin.designation}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {admin.department}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {admin.countryCode} {admin.phoneNumber}
                      </TableCell>
                      <TableCell>{getStatusChip(admin.status)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Tooltip title="Edit Admin">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(admin)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": {
                                  color: "#3b82f6",
                                  bgcolor: alpha("#3b82f6", 0.1),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Admin">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteModal(admin)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": {
                                  color: "#ef4444",
                                  bgcolor: alpha("#ef4444", 0.1),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
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
                borderTop: "1px solid #e5e7eb",
              }}
            />
          </>
        )}
      </Paper>

      {/* Form Modal */}
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
            borderBottom: "1px solid #e5e7eb",
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEdit ? "Edit Admin" : "Add New Admin"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Name and Email */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                placeholder="Enter admin name"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                disabled={isEdit}
                placeholder="Enter email address"
              />
            </Box>

            {/* Role and Status */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                required
              >
                <MenuItem value={ROLES.SUPER_ADMIN}>Super Admin</MenuItem>
                <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
                <MenuItem value={ROLES.MANAGER}>Manager</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                required
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </TextField>
            </Box>

            {/* Designation and Department */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                error={!!formErrors.designation}
                helperText={formErrors.designation}
                required
                placeholder="Enter designation"
              />
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                error={!!formErrors.department}
                helperText={formErrors.department}
                required
                placeholder="Enter department"
              />
            </Box>

            {/* Phone Number */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Country Code"
                value={formData.countryCode}
                onChange={(e) => handleInputChange("countryCode", e.target.value)}
                required
                sx={{ width: "30%" }}
                placeholder="+1"
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                required
                placeholder="Enter phone number"
              />
            </Box>

            {/* Date of Birth and Password */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              {!isEdit && (
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required
                  placeholder="Enter password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: "1px solid #e5e7eb",
            px: 3,
            py: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseFormModal}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#e5e7eb",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: alpha("#6b7280", 0.05),
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
              textTransform: "none",
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              "&:disabled": {
                bgcolor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : isEdit ? (
              "Update Admin"
            ) : (
              "Create Admin"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#ef4444" }}>
            Delete Admin
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
            Are you sure you want to delete this admin?
          </Typography>
          {selectedAdmin && (
            <Box
              sx={{
                p: 2,
                bgcolor: alpha("#ef4444", 0.05),
                borderRadius: 1,
                border: `1px solid ${alpha("#ef4444", 0.2)}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#1f2937", mb: 0.5 }}
              >
                {selectedAdmin.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                Email: {selectedAdmin.email}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                Role: {ROLE_NAMES[selectedAdmin.role]}
              </Typography>
            </Box>
          )}
          <Typography
            variant="body2"
            sx={{ color: "#ef4444", mt: 2, fontWeight: 500 }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteModal}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#e5e7eb",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: alpha("#6b7280", 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={isLoading}
            sx={{
              textTransform: "none",
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
              "&:disabled": {
                bgcolor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            {isLoading ? <CircularProgress size={20} /> : "Delete Admin"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;

