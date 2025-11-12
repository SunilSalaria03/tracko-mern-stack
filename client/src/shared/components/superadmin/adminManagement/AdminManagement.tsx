// src/features/admins/pages/AdminManagement.tsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
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
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from "ag-grid-community";

import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../../../store/actions/adminActions";

import type { Admin, AdminFormData } from "../../../../utils/interfaces/adminInterface";
import { ROLES, ROLE_NAMES } from "../../../../utils/constants/roles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { adminInitialValues } from "../../../../utils/validations/adminValidation";
import {
  AdminDeleteModal,
  AdminFormModal,
  AdminViewModal,
} from "./AdminManagementModals";

// ---------- debounce ----------
function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------- helpers ----------
const getRoleChipColor = (role: number) =>
  role === ROLES.SUPER_ADMIN ? "error" : role === ROLES.ADMIN ? "warning" : "info";

const formatPhone = (cc?: string, ph?: string) => [cc, ph].filter(Boolean).join(" ");

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

// ---------- cell renderers ----------
const RoleCellRenderer = (p: ICellRendererParams) => {
  const role = (p.value as number) ?? ROLES.MANAGER;
  return <Chip label={ROLE_NAMES[role]} color={getRoleChipColor(role)} size="small" />;
};

const StatusCellRenderer = (p: ICellRendererParams) => {
  const status = Number(p.value ?? 0);
  return status === 1 ? (
    <Chip label="Active" color="success" size="small" />
  ) : (
    <Chip label="Inactive" size="small" />
  );
};

const ActionsCellRenderer = (p: ICellRendererParams) => {
  const { onView, onEdit, onDelete } = p.context;
  const admin = p.data as Admin;
  return (
    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "left", alignItems: "center" }}>
      <Tooltip title="View">
        <IconButton
          size="small"
          onClick={() => onView(admin)}
          sx={{ color: "#6b7280", "&:hover": { color: "#10b981", bgcolor: alpha("#10b981", 0.1) } }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => onEdit(admin)}
          sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) } }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => onDelete(admin)}
          sx={{ color: "#6b7280", "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// ---------- component ----------
const AdminManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { admins, isLoading, error } = useAppSelector((s) => s.adminManagement);
  const { user } = useAppSelector((s) => s.auth);

  // Super Admin gate
  useEffect(() => {
    if (user && user.role !== ROLES.SUPER_ADMIN) {
      toast.error("Access denied. Only Super Admin can manage admins.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm.trim().toLowerCase(), 400);
  const [roleFilter, setRoleFilter] = useState<0 | 1 | 2 | "">("");
  const [statusFilter, setStatusFilter] = useState<0 | 1 | "">("");

  // grid
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // modals
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Admin | null>(null);
  const [viewing, setViewing] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState<Admin | null>(null);
  const [formValues, setFormValues] = useState<AdminFormData>(adminInitialValues);

  // fetch once (sorted). We’re doing client-side filter/pagination in AG Grid.
  useEffect(() => {
    dispatch(fetchAdmins({ sortBy: "createdAt", sortOrder: "desc" }))
      .unwrap()
      .catch(() => toast.error("Failed to fetch admins"));
  }, [dispatch]);

  // toast API errors
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // derived + filtered list
  const filteredAdmins = useMemo(() => {
    let data = admins;

    if (roleFilter !== "") {
      data = data.filter((a) => Number(a.role) === Number(roleFilter));
    }
    if (statusFilter !== "") {
      data = data.filter((a) => Number(a.status) === Number(statusFilter));
    }
    if (debouncedSearch) {
      const q = debouncedSearch;
      data = data.filter((a) =>
        [a.name, a.email, a.department, a.designation, a.phoneNumber, a.countryCode]
          .map((v) => (v || "").toString().toLowerCase())
          .some((v) => v.includes(q))
      );
    }
    return data;
  }, [admins, roleFilter, statusFilter, debouncedSearch]);

  // stats
  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a) => Number(a.status) === 1).length;
    const superAdmins = admins.filter((a) => a.role === ROLES.SUPER_ADMIN).length;
    const adminsCount = admins.filter((a) => a.role === ROLES.ADMIN).length;
    const managers = admins.filter((a) => a.role === ROLES.MANAGER).length;
    return { total, active, superAdmins, adminsCount, managers };
  }, [admins]);

  // handlers
  const openCreate = useCallback(() => {
    setEditing(null);
    setFormValues(adminInitialValues);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((a: Admin) => {
    setEditing(a);
    setFormValues({
      role: a.role,
      email: a.email,
      name: a.name,
      phoneNumber: a.phoneNumber,
      countryCode: a.countryCode,
      designation: a.designation,
      department: a.department,
      password: "", // keep empty when editing
      dateOfBirth: a.dateOfBirth || "",
    });
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => setFormOpen(false), []);

  const openView = useCallback((a: Admin) => {
    setViewing(a);
    setViewOpen(true);
  }, []);
  const closeView = useCallback(() => {
    setViewing(null);
    setViewOpen(false);
  }, []);

  const openDelete = useCallback((a: Admin) => {
    setDeleting(a);
    setDeleteOpen(true);
  }, []);
  const closeDelete = useCallback(() => {
    setDeleting(null);
    setDeleteOpen(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (vals: AdminFormData) => {
      try {
        if (editing) {
          await dispatch(updateAdmin({ id: editing._id, data: vals })).unwrap();
          toast.success("Admin updated successfully");
        } else {
          await dispatch(createAdmin(vals)).unwrap();
          toast.success("Admin created successfully");
        }
        closeForm();
        await dispatch(fetchAdmins({ sortBy: "createdAt", sortOrder: "desc" })).unwrap();
      } catch (e: any) {
        toast.error(e || (editing ? "Failed to update admin" : "Failed to create admin"));
      }
    },
    [dispatch, editing, closeForm]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteAdmin(deleting._id)).unwrap();
      toast.success("Admin deleted successfully");
      closeDelete();
      await dispatch(fetchAdmins({ sortBy: "createdAt", sortOrder: "desc" })).unwrap();
    } catch (e: any) {
      toast.error(e || "Delete failed");
    }
  }, [dispatch, deleting, closeDelete]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `admins_${new Date().toISOString().split("T")[0]}.csv`,
      });
      toast.success("Admins exported successfully!");
    }
  }, [gridApi]);

  // grid defs
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Name",
        field: "name",
        flex: 1.5,
        minWidth: 160,
        sortable: true,
        filter: true,
        cellRenderer: (p: ICellRendererParams) => {
          const a = p.data as Admin;
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
              {a.name}
            </Typography>
          );
        },
      },
      {
        headerName: "Email",
        field: "email",
        flex: 1.8,
        minWidth: 200,
        sortable: true,
        filter: true,
        valueGetter: (p) => (p.data as Admin).email || "-",
      },
      {
        headerName: "Role",
        field: "role",
        flex: 1,
        minWidth: 120,
        cellRenderer: RoleCellRenderer,
        sortable: true,
      },
      {
        headerName: "Designation",
        field: "designation",
        flex: 1.2,
        minWidth: 140,
        sortable: true,
        valueGetter: (p) => (p.data as Admin).designation || "-",
      },
      {
        headerName: "Department",
        field: "department",
        flex: 1.2,
        minWidth: 140,
        sortable: true,
        valueGetter: (p) => (p.data as Admin).department || "-",
      },
      {
        headerName: "Phone",
        field: "phoneNumber",
        flex: 1.4,
        minWidth: 150,
        sortable: true,
        valueGetter: (p) => {
          const a = p.data as Admin;
          return formatPhone(a.countryCode, a.phoneNumber) || "-";
        },
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 110,
        cellRenderer: StatusCellRenderer,
        sortable: true,
      },
      {
        headerName: "Created",
        field: "createdAt",
        flex: 1.2,
        minWidth: 130,
        sortable: true,
        valueFormatter: (p) => formatDate(p.value),
      },
      {
        headerName: "Updated",
        field: "updatedAt",
        flex: 1.2,
        minWidth: 130,
        sortable: true,
        valueFormatter: (p) => formatDate(p.value),
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: ActionsCellRenderer,
        flex: 1,
        minWidth: 130,
        pinned: "right",
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

  const context = useMemo(
    () => ({
      onView: openView,
      onEdit: openEdit,
      onDelete: openDelete,
    }),
    [openView, openEdit, openDelete]
  );

  // UI filtered dataset is `filteredAdmins`; feed that to the grid
  const gridData = filteredAdmins;

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
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
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1f2937" }}>
          Admin Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={gridData.length === 0}
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              textTransform: "none",
              px: 2.5,
              py: 1,
              fontWeight: 600,
              "&:hover": { borderColor: "#9ca3af", bgcolor: alpha("#6b7280", 0.05) },
              "&:disabled": { borderColor: "#e5e7eb", color: "#d1d5db" },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{
              bgcolor: "#10b981",
              color: "white",
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 600,
              "&:hover": { bgcolor: "#059669" },
            }}
          >
            Add Admin
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 200,
            p: 2.5,
            border: "1px solid #e5e7eb",
            borderLeft: "4px solid #3b82f6",
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Total Admins
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.total}
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
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Active Admins
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.active}
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
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Super Admins / Admins / Managers
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.superAdmins} / {stats.adminsCount} / {stats.managers}
          </Typography>
        </Paper>
      </Box>

      {/* Search + Filters */}
      <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e5e7eb", "&:focus-within": { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.1)" } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, department, designation, or phone..."
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
                    sx={{ color: "#6b7280", "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white", "& fieldset": { border: "none" } } }}
          />

          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 0 | 1 | 2 | "")}
            sx={{ minWidth: 160, bgcolor: "white" }}
            size="small"
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value={ROLES.SUPER_ADMIN}>{ROLE_NAMES[ROLES.SUPER_ADMIN]}</MenuItem>
            <MenuItem value={ROLES.ADMIN}>{ROLE_NAMES[ROLES.ADMIN]}</MenuItem>
            <MenuItem value={ROLES.MANAGER}>{ROLE_NAMES[ROLES.MANAGER]}</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 0 | 1 | "")}
            sx={{ minWidth: 160, bgcolor: "white" }}
            size="small"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value={1}>Active</MenuItem>
            <MenuItem value={0}>Inactive</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Grid */}
      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#3b82f6" }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : gridData.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 1 }}>
              No admins found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch ? "Try adjusting your search terms" : "Click 'Add Admin' to create your first admin"}
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
              >
                Add Admin
              </Button>
            )}
          </Box>
        ) : (
          <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={gridData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              onGridReady={onGridReady}
              animateRows={true}
              rowHeight={60}
              headerHeight={48}
              context={context}
              suppressCellFocus={true}
              enableCellTextSelection={true}
            />
          </div>
        )}
      </Paper>

      {/* Modals */}
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
        highlight={deleting ? `${deleting.name} (${deleting.email})` : undefined}
      />
    </Box>
  );
};

export default AdminManagement;
