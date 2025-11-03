import { useState, useEffect, useMemo, useCallback } from "react";
import type { ChangeEvent } from "react";
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
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Alert,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchUsers,
  createUser,
  updateUser,
} from "../../../../store/actions/userActions";
import type { User } from "../../../../utils/interfaces/userInterface";
import type { UserRole } from "../../../../utils/interfaces/userInterface";
import { useFormik } from "formik";
import {
  useDebounced,
  combinedFromParts,
  splitCombinedPhone,
  sanitizePhone,
} from "../../../../utils/common/helpers";
import { getUserValidationSchema } from "../../../../utils/validations/UserValidations";
import { UserFormDialog, UserViewDialog } from "./UserManagementModals";

/** Shape used */
type EditableUser = {
  _id?: string;
  email?: string;
  password?: string;
  name?: string;
  designation?: string;
  department?: string;
  profileImage?: string;
  status?: 0 | 1;
  role?: UserRole;
  phoneNumber?: string;
  countryCode?: string;
  dateOfBirth?: string;
};

const initialForm: EditableUser = {
  email: "",
  password: "",
  name: "",
  designation: "",
  department: "",
  profileImage: "https://example.com/image.jpg",
  status: 1,
  role: 3,
  phoneNumber: "",
  countryCode: "+91",
  dateOfBirth: "", 
};

 
const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((s) => s.user);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm.trim().toLowerCase(), 400);

  const [openFormModal, setOpenFormModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchUsers())
      .unwrap()
      .catch(() => toast.error("Failed to fetch users"));
  }, [dispatch]);

  const formValidationSchema = useMemo(
    () => getUserValidationSchema(Boolean(editingId)),
    [editingId]
  );

  const formik = useFormik<EditableUser>({
    initialValues: initialForm,
    enableReinitialize: false,
    validationSchema: formValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        const payload: EditableUser = {
          email: (values.email || "").trim(),
          name: values.name?.trim() || "",
          designation: values.designation?.trim() || "",
          department: values.department?.trim() || "",
          profileImage: values.profileImage?.trim() || "",
          role: (values.role ?? 3) as UserRole,
          phoneNumber: values.phoneNumber?.trim() || "",
          countryCode: values.countryCode?.trim() || "",
          dateOfBirth: values.dateOfBirth?.trim() || "",
          ...(values.password ? { password: values.password.trim() } : {}),
        };

        if (editingId) {
          await dispatch(updateUser({ id: editingId, data: payload })).unwrap();
          toast.success("User updated successfully!");
        } else {
          await dispatch(createUser(payload)).unwrap();
          toast.success("User created successfully!");
        }

        await dispatch(fetchUsers()).unwrap();
        handleCloseForm();
      } catch {
        toast.error(
          editingId ? "Failed to update user" : "Failed to create user"
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  const combinedPhoneValue = useMemo(
    () =>
      combinedFromParts(formik.values.countryCode, formik.values.phoneNumber),
    [formik.values.countryCode, formik.values.phoneNumber]
  );

  const handleCombinedPhoneChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const { cc, rest } = splitCombinedPhone(raw);
      if (cc) {
        formik.setFieldValue("countryCode", cc);
        formik.setFieldTouched("countryCode", true, false);
      }
      const sanitized = sanitizePhone(rest);
      formik.setFieldValue("phoneNumber", sanitized);
      formik.setFieldTouched("phoneNumber", true, false);
    },
    [formik]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch;
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.phoneNumber, u.countryCode, String(u.status)]

        .map((v) => (v || "").toString().toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [users, debouncedSearch]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleOpenAdd = useCallback(() => {
    setEditingId(null);
    formik.resetForm({ values: initialForm });
    setOpenFormModal(true);
  }, [formik]);

  const handleOpenEdit = useCallback(
    (u: User) => {
      setEditingId(u._id);
      formik.resetForm({
        values: {
          _id: u._id,
          email: u.email || "",
          password: "",
          name: u.name || "",
          designation: u.designation || "",
          department: (u as any).department || "",
          profileImage: u.profileImage || "",
          status: (u.status ?? 1) as 0 | 1,
          role: (u.role ?? 3) as UserRole,
          phoneNumber: u.phoneNumber || "",
          countryCode: u.countryCode || "+91",
          dateOfBirth: u.dateOfBirth
            ? u.dateOfBirth.length > 10
              ? u.dateOfBirth.slice(0, 10)
              : u.dateOfBirth
            : "",
        },
      });
      setOpenFormModal(true);
    },
    [formik]
  );

  const handleCloseForm = useCallback(() => {
    setOpenFormModal(false);
    setEditingId(null);
    formik.resetForm({ values: initialForm });
  }, [formik]);

  const handleOpenView = useCallback((u: User) => {
    setViewingUser(u);
    setOpenViewModal(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setOpenViewModal(false);
    setViewingUser(null);
  }, []);

  const formatDate = (dateString?: string): string =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

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
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Manage application users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
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
          Add User
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, phone or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#6b7280" }} />
              </InputAdornment>
            ),
            endAdornment: !!searchTerm && (
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

        {!isLoading && !error && filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No users found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch
                ? "Try adjusting your search terms"
                : "Click 'Add User' to create your first user"}
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                sx={{
                  bgcolor: "#10b981",
                  color: "white",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                Add User
              </Button>
            )}
          </Box>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    S.No
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Phone
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    DOB
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Created
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Updated
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
                {paginated.map((u, index) => (
                  <TableRow
                    key={u._id}
                    sx={{
                      "&:hover": { bgcolor: alpha("#3b82f6", 0.05) },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1f2937" }}
                      >
                        {u.name || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell sx={{ color: "#6b7280" }}>
                      {(u.countryCode ? `${u.countryCode} ` : "") +
                        (u.phoneNumber || "-")}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280" }}>
                      {u.status === 1 ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280" }}>
                      {u.dateOfBirth ? formatDate(u.dateOfBirth) : "-"}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280" }}>
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280" }}>
                      {formatDate(u.updatedAt)}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(u)}
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
                        <Tooltip title="View User">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenView(u)}
                            sx={{
                              color: "#6b7280",
                              "&:hover": {
                                color: "#3b82f6",
                                bgcolor: alpha("#3b82f6", 0.1),
                              },
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {!isLoading && !error && filtered.length > 0 && (
        <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderTop: 0 }}>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

       <UserFormDialog
        open={openFormModal}
        onClose={handleCloseForm}
        formik={formik}
        combinedPhoneValue={combinedPhoneValue}
        handleCombinedPhoneChange={handleCombinedPhoneChange}
        editingId={editingId}
      />

       <UserViewDialog
        open={openViewModal}
        onClose={handleCloseView}
        user={viewingUser}
        formatDate={formatDate}
      />
    </Box>
  );
};

export default UserManagement;
