import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
} from "ag-grid-community";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../../store/actions/departmentActions";
import type {
  Department,
  DepartmentFormData,
} from "../../../../utils/interfaces/departmentInterface";
import { toast } from "react-toastify";
import {
  DepartmentFormModal,
  DepartmentDeleteModal,
  DepartmentViewModal,
} from "./DepartmentManagementModals";

// -------------------- Debounce Hook --------------------
function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// -------------------- Constants & Helpers --------------------
const initialFormValues: DepartmentFormData = {
  name: "",
  description: "",
  status: 1,
};

const formatDate = (dateString?: string): string =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

// -------------------- Cell Renderers --------------------
const StatusCellRenderer = (props: ICellRendererParams) => {
  const isActive = Number(props.value ?? 1) === 1;
  return (
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
  );
};

const ActionsCellRenderer = (props: ICellRendererParams) => {
  const { onEdit, onDelete, onView } = props.context;
  const dept = props.data as Department;

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="View">
        <IconButton
          size="small"
          onClick={() => onView(dept)}
          sx={{ color: "#6b7280", "&:hover": { color: "#10b981", bgcolor: alpha("#10b981", 0.1) } }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => onEdit(dept)}
          sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) } }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => onDelete(dept)}
          sx={{ color: "#6b7280", "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// -------------------- Main Component --------------------
const DepartmentManagement = () => {
  const dispatch = useAppDispatch();
  const { departments, isLoading, error } = useAppSelector(
    (state) => state.departmentManagement
  );

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm.trim().toLowerCase(), 400);

  // modals & selection
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // grid
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const gridRef = useRef<AgGridReact>(null);

  // fetch once (sorted) – AG Grid handles pagination/filter on client
  useEffect(() => {
    dispatch(fetchDepartments({ sortBy: "createdAt", sortOrder: "desc" }))
      .unwrap()
      .catch(() => toast.error("Failed to fetch departments"));
  }, [dispatch]);

  // error toast
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // stats
  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((d) => Number(d.status) === 1).length;
    const inactive = departments.filter((d) => Number(d.status) !== 1).length;
    return { total, active, inactive };
  }, [departments]);

  // filtered rows (client-side)
  const filtered = useMemo(() => {
    const q = debouncedSearch;
    if (!q) return departments;
    return departments.filter((d) =>
      [d.name, d.description, d.addedBy?.name, String(d.status)]
        .map((v) => (v || "").toString().toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [departments, debouncedSearch]);

  // handlers
  const handleOpenAddModal = useCallback(() => {
    setIsEdit(false);
    setSelectedDepartment(null);
    setOpenFormModal(true);
  }, []);

  const handleOpenEditModal = useCallback((department: Department) => {
    setIsEdit(true);
    setSelectedDepartment(department);
    setOpenFormModal(true);
  }, []);

  const handleOpenViewModal = useCallback((department: Department) => {
    setSelectedDepartment(department);
    setOpenViewModal(true);
  }, []);

  const handleOpenDeleteModal = useCallback((department: Department) => {
    setSelectedDepartment(department);
    setOpenDeleteModal(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setOpenFormModal(false);
    setSelectedDepartment(null);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setOpenViewModal(false);
    setSelectedDepartment(null);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false);
    setSelectedDepartment(null);
  }, []);

  const refresh = useCallback(async () => {
    await dispatch(fetchDepartments({ sortBy: "createdAt", sortOrder: "desc" })).unwrap();
  }, [dispatch]);

  const handleDelete = useCallback(async () => {
    if (!selectedDepartment) return;
    try {
      await dispatch(deleteDepartment(selectedDepartment._id)).unwrap();
      toast.success("Department deleted successfully!");
      handleCloseDeleteModal();
      await refresh();
    } catch {
      toast.error("Failed to delete department");
    }
  }, [dispatch, selectedDepartment, handleCloseDeleteModal, refresh]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `departments_${new Date().toISOString().split("T")[0]}.csv`,
      });
      toast.success("Departments exported successfully!");
    }
  }, [gridApi]);

  // grid defs
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Department Name",
        field: "name",
        flex: 2,
        minWidth: 220,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Description",
        field: "description",
        flex: 2,
        minWidth: 220,
        valueFormatter: (p) =>
          p.value ? `${p.value.substring(0, 60)}${p.value.length > 60 ? "..." : ""}` : "-",
      },
      {
        headerName: "Added By",
        field: "addedBy.name",
        flex: 1.5,
        minWidth: 150,
        valueGetter: (p) => p.data?.addedBy?.name || "-",
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 110,
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "Created Date",
        field: "createdAt",
        flex: 1.3,
        minWidth: 130,
        valueFormatter: (p) => formatDate(p.value),
      },
      {
        headerName: "Updated Date",
        field: "updatedAt",
        flex: 1.3,
        minWidth: 130,
        valueFormatter: (p) => formatDate(p.value),
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: ActionsCellRenderer,
        flex: 1,
        minWidth: 120,
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
      onEdit: handleOpenEditModal,
      onDelete: handleOpenDeleteModal,
      onView: handleOpenViewModal,
    }),
    [handleOpenEditModal, handleOpenDeleteModal, handleOpenViewModal]
  );

  // initial form values (always DepartmentFormData)
  const formInitialValues = useMemo<DepartmentFormData>(() => {
    return isEdit && selectedDepartment
      ? {
          name: selectedDepartment.name ?? "",
          description: selectedDepartment.description ?? "",
          status: (selectedDepartment.status ?? 1) as 0 | 1,
        }
      : initialFormValues;
  }, [isEdit, selectedDepartment]);

  // -------------------- Render --------------------
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
          Department Management
        </Typography>
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
              "&:hover": { borderColor: "#9ca3af", bgcolor: alpha("#6b7280", 0.05) },
              "&:disabled": { borderColor: "#e5e7eb", color: "#d1d5db" },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
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
            Add Department
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
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
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Total Departments
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
            transition: "all 0.2s",
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Active Departments
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
            transition: "all 0.2s",
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Inactive Departments
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.inactive}
          </Typography>
        </Paper>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e5e7eb", "&:focus-within": { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.1)" } }}>
        <TextField
          fullWidth
          placeholder="Search departments by name, description, or status..."
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
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 1 }}>
              No departments found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch ? "Try adjusting your search terms" : "Click 'Add Department' to create your first department"}
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal}
                sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
              >
                Add Department
              </Button>
            )}
          </Box>
        ) : (
          <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={filtered}
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
      <DepartmentFormModal
        isOpen={openFormModal}
        isEdit={isEdit}
        initialValues={formInitialValues}
        isLoading={isLoading}
        onClose={handleCloseFormModal}
        onSubmit={async (values: DepartmentFormData) => {
          try {
            if (isEdit && selectedDepartment) {
              await dispatch(updateDepartment({ id: selectedDepartment._id, data: values })).unwrap();
              toast.success("Department updated successfully!");
            } else {
              await dispatch(createDepartment(values)).unwrap();
              toast.success("Department created successfully!");
            }
            await refresh();
            handleCloseFormModal();
          } catch {
            toast.error(isEdit ? "Failed to update department" : "Failed to create department");
          }
        }}
      />

      <DepartmentDeleteModal
        isOpen={openDeleteModal}
        departmentName={selectedDepartment?.name || ""}
        isLoading={isLoading}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleDelete}
      />

      <DepartmentViewModal
        isOpen={openViewModal}
        department={selectedDepartment}
        onClose={handleCloseViewModal}
      />
    </Box>
  );
};

export default DepartmentManagement;
