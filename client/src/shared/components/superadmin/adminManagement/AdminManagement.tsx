// src/features/admins/pages/AdminManagement.tsx
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
  CircularProgress,
  Alert,
  Tooltip,
  MenuItem,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
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
import { adminInitialValues } from "../../../../utils/validations/adminValidation";
import {
  AdminDeleteModal,
  AdminFormModal,
  AdminViewModal,
} from "./AdminManagementModals";

const AdminManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { admins, total, isLoading, error } = useAppSelector(
    (s) => s.adminManagement
  );
   const { user } = useAppSelector((s) => s.auth);

  // Super Admin gate
  useEffect(() => {
    if (user && user.role !== ROLES.SUPER_ADMIN) {
      toast.error("Access denied. Only Super Admin can manage admins.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // filters & paging
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<0 | 1 | 2 | "">("");
  const [statusFilter, setStatusFilter] = useState<0 | 1 | "">("");

  // modals & targets
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [viewing, setViewing] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState<Admin | null>(null);
  const [formValues, setFormValues] =
    useState<AdminFormData>(adminInitialValues);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // fetch list
  const refresh = () =>
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

  useEffect(() => {
    refresh();
  }, [page, rowsPerPage, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

   const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

   const openCreate = () => {
    setEditing(null);
    setFormValues(adminInitialValues);
    setFormOpen(true);
  };
  const openEdit = (a: Admin) => {
    setEditing(a);
    setFormValues({
      role: a.role,
      email: a.email,
      name: a.name,
      phoneNumber: a.phoneNumber,
      countryCode: a.countryCode,
      designation: a.designation,
      department: a.department,
       password: "",  
      dateOfBirth: a.dateOfBirth || "",
    });
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const openView = (a: Admin) => {
    setViewing(a);
    setViewOpen(true);
  };
  const closeView = () => {
    setViewing(null);
    setViewOpen(false);
  };

  const openDelete = (a: Admin) => {
    setDeleting(a);
    setDeleteOpen(true);
  };
  const closeDelete = () => {
    setDeleting(null);
    setDeleteOpen(false);
  };

  // submit handlers
  const handleFormSubmit = async (vals: AdminFormData) => {
    try {
      if (editing) {
        await dispatch(updateAdmin({ id: editing._id, data: vals })).unwrap();
        toast.success("Admin updated successfully");
      } else {
        await dispatch(createAdmin(vals)).unwrap();
        toast.success("Admin created successfully");
      }
      closeForm();
      refresh();
    } catch (e: any) {
      toast.error(
        e || (editing ? "Failed to update admin" : "Failed to create admin")
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteAdmin(deleting._id)).unwrap();
      toast.success("Admin deleted successfully");
      closeDelete();
      refresh();
    } catch (e: any) {
      toast.error(e || "Delete failed");
    }
  };

  // helpers
  const getRoleChipColor = (role: number) =>
    role === ROLES.SUPER_ADMIN
      ? "error"
      : role === ROLES.ADMIN
        ? "warning"
        : "info";

  const getStatusChip = (status: number) =>
    status === 1 ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Inactive" size="small" />
    );

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
          onClick={openCreate}
          sx={{
            bgcolor: "#10b981",
            color: "white",
            textTransform: "none",
            px: 3,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": { bgcolor: "#059669" },
          }}
        >
          Add Admin
        </Button>
      </Box>

      {/* Search + Filters */}
      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
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
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
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
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value={ROLES.SUPER_ADMIN}>
                {ROLE_NAMES[ROLES.SUPER_ADMIN]}
              </MenuItem>
              <MenuItem value={ROLES.ADMIN}>{ROLE_NAMES[ROLES.ADMIN]}</MenuItem>
              <MenuItem value={ROLES.MANAGER}>
                {ROLE_NAMES[ROLES.MANAGER]}
              </MenuItem>
            </TextField>

            <TextField
              select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 0 | 1 | "");
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Inactive</MenuItem>
            </TextField>
          </Box>
        </Box>
      </Paper>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}
      >
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
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
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
                onClick={openCreate}
                sx={{
                  bgcolor: "#10b981",
                  color: "white",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  "&:hover": { bgcolor: "#059669" },
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
                        "&:hover": { bgcolor: alpha("#3b82f6", 0.05) },
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
                      <TableCell>
                        {admin.status === 1 ? (
                          <Chip label="Active" color="success" size="small" />
                        ) : (
                          <Chip label="Inactive" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => openView(admin)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": {
                                  color: "#111827",
                                  bgcolor: alpha("#111827", 0.06),
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => openEdit(admin)}
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
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => openDelete(admin)}
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

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: "1px solid #e5e7eb" }}
            />
          </>
        )}
      </Paper>

      <AdminFormModal
        open={formOpen}
        isEdit={!!editing}
        initialValues={formValues}
        isSubmitting={isLoading}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <AdminViewModal open={viewOpen} admin={viewing} onClose={closeView} />

      <AdminDeleteModal
        open={deleteOpen}
        isLoading={isLoading}
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
        highlight={
          deleting ? `${deleting.name} (${deleting.email})` : undefined
        }
      />
    </Box>
  );
};

export default AdminManagement;
