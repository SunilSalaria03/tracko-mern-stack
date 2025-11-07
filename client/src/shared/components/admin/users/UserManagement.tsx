import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  alpha,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { AgGridReact } from "ag-grid-react";
import type { 
  ColDef, 
  GridReadyEvent, 
  GridApi,
  ICellRendererParams 
} from "ag-grid-community";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchUsers,
  createUser,
  updateUser,
} from "../../../../store/actions/userActions";
import type { EditableUser, User } from "../../../../utils/interfaces/userInterface";
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

const initialForm: EditableUser = {
  email: "",
  password: "",
  name: "",
  designation: "",
  department: "",
  profileImage: "",
  status: 1,
  role: 3,
  phoneNumber: "",
  countryCode: "+91",
  dateOfBirth: "",
};

const NameCellRenderer = (props: ICellRendererParams) => {
  const user = props.data as User;
  
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
      <Avatar
        src={user.profileImage}
        alt={user.name}
        sx={{
          width: 36,
          height: 36,
          bgcolor: "#3b82f6",
          fontSize: "0.875rem",
          fontWeight: 600,
        }}
      >
        {user.name?.charAt(0)?.toUpperCase() || "U"}
      </Avatar>
      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1f2937", lineHeight: 1.3 }}
        >
          {user.name || "-"}
        </Typography>
      </Box>
    </Box>
  );
};

const StatusCellRenderer = (props: ICellRendererParams) => {
  const isActive = props.value === 1;
  
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Chip
        label={isActive ? "Active" : "Inactive"}
        size="small"
        sx={{
          bgcolor: isActive ? alpha("#10b981", 0.1) : alpha("#ef4444", 0.1),
          color: isActive ? "#059669" : "#dc2626",
          fontWeight: 600,
          fontSize: "0.75rem",
          height: 24,
          "& .MuiChip-label": { px: 1.5 },
        }}
      />
    </Box>
  );
};

const ActionsCellRenderer = (props: ICellRendererParams) => {
  const { onEdit, onView } = props.context;
  const user = props.data as User;

  return (
    <Box 
      sx={{ 
        display: "flex", 
        gap: 0.5, 
        justifyContent: "left",
        alignItems: "left",
        height: "100%" 
      }}
    >
      <Tooltip title="Edit User">
        <IconButton
          size="small"
          onClick={() => onEdit(user)}
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
          onClick={() => onView(user)}
          sx={{
            color: "#6b7280",
            "&:hover": {
              color: "#10b981",
              bgcolor: alpha("#10b981", 0.1),
            },
          }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((s) => s.user);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm.trim().toLowerCase(), 400);

  // Modal states
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  // User editing/viewing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // AG Grid refs and state
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

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
          designationId: values.designation?.trim() || "",
          departmentId: values.department?.trim() || "",
          role: (values.role ?? 3) as UserRole,
          phoneNumber: values.phoneNumber?.trim() || "",
          countryCode: values.countryCode?.trim() || "",
          dateOfBirth: values.dateOfBirth?.trim() || "",
          ...(values.password ? { password: values.password.trim() } : {}),
        };

        if (values.profileImage) {
          payload.profileImage = values.profileImage?.trim() || "";
        } 
        if (values.status) {
          payload.status = values.status
        }

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

  const formatDate = (dateString?: string): string =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

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
          department: (u as User).department || "",
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

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "User",
        field: "name",
        cellRenderer: NameCellRenderer,
        flex: 2,
        minWidth: 220,
        sortable: true,
        filter: true,
        cellStyle: () => ({ display: "flex", alignItems: "center" }),
      },
      {
        headerName: "Email",
        field: "email",
        flex: 2,
        minWidth: 220,
        sortable: true,
        filter: true,
        cellStyle: () => ({ display: "flex", alignItems: "center" }),
      },
      {
        headerName: "Phone",
        field: "phoneNumber",
        flex: 1.5,
        minWidth: 160,
        sortable: true,
        valueGetter: (params) => {
          const user = params.data as User;
          return (user.countryCode ? `${user.countryCode} ` : "") + (user.phoneNumber || "-");
        },
        cellStyle: () => ({ display: "flex", alignItems: "center" }),
      },
      {
        headerName: "Status",
        field: "status",
        cellRenderer: StatusCellRenderer,
        flex: 1,
        minWidth: 110,
        sortable: true,
        filter: true,
        cellStyle: () => ({ display: "flex", alignItems: "center" }),
      },
      {
        headerName: "Date of Birth",
        field: "dateOfBirth",
        flex: 1.3,
        minWidth: 130,
        sortable: true,
        valueFormatter: (params) => formatDate(params.value),
        cellStyle: () => ({ display: "flex", alignItems: "center" }),
      },
      {
        headerName: "Created",
        field: "createdAt",
        flex: 1.3,
        minWidth: 130,
        sortable: true,
        valueFormatter: (params) => formatDate(params.value),
        cellStyle: () => ({ display: "flex", alignItems: "center" }),
      },
      {
        headerName: "Updated",
        field: "updatedAt",
        flex: 1.3,
        minWidth: 130,
        sortable: true,
        valueFormatter: (params) => formatDate(params.value),
        cellStyle: () => ({ display: "flex", alignItems: "center" }),
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: ActionsCellRenderer,
        flex: 1,
        minWidth: 120,
        sortable: false,
        filter: false,
        pinned: "right",
        cellStyle: () => ({
          display: "flex",
          alignItems: "left",
          justifyContent: "left"
        }),
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: false,
    }),
    []
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

  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `users_${new Date().toISOString().split('T')[0]}.csv`,
      });
      toast.success("Users exported successfully!");
    }
  }, [gridApi]);

  const context = useMemo(
    () => ({
      onEdit: handleOpenEdit,
      onView: handleOpenView,
    }),
    [handleOpenEdit, handleOpenView]
  );

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* ========== Header ========== */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: "#1f2937", mb: 0.5 }}
          >
            User Management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              textTransform: "none",
              px: 2.5,
              py: 1,
              fontWeight: 600,
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: alpha("#6b7280", 0.05),
              },
              "&:disabled": {
                borderColor: "#e5e7eb",
                color: "#d1d5db",
              },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              bgcolor: "#10b981",
              color: "white",
              textTransform: "none",
              px: 3,
              py: 1,
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
              "&:hover": {
                bgcolor: "#059669",
                boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.4)",
              },
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* ========== Stats Cards ========== */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 200,
            p: 2.5,
            border: "1px solid #e5e7eb",
            borderLeft: "4px solid #3b82f6",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Total Users
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {users.length}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 200,
            p: 2.5,
            border: "1px solid #e5e7eb",
            borderLeft: "4px solid #10b981",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Active Users
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {users.filter((u) => u.status === 1).length}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 200,
            p: 2.5,
            border: "1px solid #e5e7eb",
            borderLeft: "4px solid #ef4444",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Inactive Users
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {users.filter((u) => u.status === 0).length}
          </Typography>
        </Paper>
      </Box>

      {/* ========== Search Bar ========== */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3,
          border: "1px solid #e5e7eb",
          transition: "all 0.2s",
          "&:focus-within": {
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
          },
        }}
      >
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
                  sx={{ 
                    color: "#6b7280",
                    "&:hover": {
                      color: "#ef4444",
                      bgcolor: alpha("#ef4444", 0.1),
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              "& fieldset": {
                border: "none",
              },
            },
          }}
        />
      </Paper>

      {/* ========== AG Grid Container ========== */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "#3b82f6" }} />
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
          <div
            className="ag-theme-alpine"
            style={{
              height: 600,
              width: "100%",
            }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filtered}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[5, 10, 25, 50, 100]}
              onGridReady={onGridReady}
              animateRows={true}
              rowHeight={60}
              headerHeight={48}
              context={context}
              suppressCellFocus={true}
              enableCellTextSelection={true}
              rowSelection="multiple"
              suppressRowClickSelection={true}
            />
          </div>
        )}
      </Paper>

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