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
  fetchDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "../../../../store/actions/designationActions";
import { fetchDepartments } from "../../../../store/actions/departmentActions";

import type {
  Designation,
  DesignationFormData,
} from "../../../../utils/interfaces/designationInterface";
import type { Department } from "../../../../utils/interfaces/departmentInterface";

import { toast } from "react-toastify";
import {
  DesignationFormModal,
  DesignationViewModal,
  DesignationDeleteModal,
} from "./DesignationManagementModals";

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
const INITIAL_FORM: DesignationFormData = {
  departmentId: "",
  name: "",
  description: "",
};

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

// -------------------- Cell Renderers --------------------
const ActionsCellRenderer = (props: ICellRendererParams) => {
  const { onEdit, onDelete, onView, getDeptName } = props.context;
  const item = props.data as Designation;

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="View">
        <IconButton
          size="small"
          onClick={() => onView(item, getDeptName(item.departmentId))}
          sx={{ color: "#6b7280", "&:hover": { color: "#10b981", bgcolor: alpha("#10b981", 0.1) } }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => onEdit(item)}
          sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) } }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => onDelete(item)}
          sx={{ color: "#6b7280", "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// -------------------- Main Component --------------------
export default function DesignationManagement() {
  const dispatch = useAppDispatch();

  const { designations, isLoading, error } = useAppSelector((s) => s.designationManagement);
  const { departments } = useAppSelector((s) => s.departmentManagement || { departments: [] });

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm.trim().toLowerCase(), 400);

  // modals & selection
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Designation | null>(null);
  const [viewing, setViewing] = useState<Designation | null>(null);
  const [deleting, setDeleting] = useState<Designation | null>(null);

  // grid
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const gridRef = useRef<AgGridReact>(null);

  // fetch (client-side grid): designations + departments
  useEffect(() => {
    dispatch(fetchDesignations({ sortBy: "createdAt", sortOrder: "desc" }))
      .unwrap()
      .catch(() => toast.error("Failed to fetch designations"));
  }, [dispatch]);

  useEffect(() => {
    if (!departments || departments.length === 0) {
      dispatch(fetchDepartments({ sortBy: "name", sortOrder: "asc" }) as any).catch(() => {
        /* no-op */
      });
    }
  }, [dispatch]);

  // error toast
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // stats (no status for designations, so show other helpful counts)
  const stats = useMemo(() => {
    const total = designations.length;
    const uniqueDeptCount = new Set(designations.map((d) => d.departmentId).filter(Boolean)).size;
    const recentCount = designations.filter((d) => {
      if (!d.createdAt) return false;
      const dt = new Date(d.createdAt);
      const now = new Date();
      const diff = (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30; // last 30 days
    }).length;
    return { total, uniqueDeptCount, recentCount };
  }, [designations]);

  // department lookup
  const getDeptName = useCallback(
    (deptId?: string) => {
      if (!deptId || !departments) return "-";
      const dept = departments.find((d: Department) => d._id === deptId);
      return dept ? dept.name : "-";
    },
    [departments]
  );

  // filtered rows
  const filtered = useMemo(() => {
    const q = debouncedSearch;
    if (!q) return designations;
    return designations.filter((d) =>
      [d.name, d.description, getDeptName(d.departmentId)]
        .map((v) => (v || "").toString().toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [designations, debouncedSearch, getDeptName]);

  // handlers
  const openAdd = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((item: Designation) => {
    setEditing(item);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const openView = useCallback((item: Designation) => {
    setViewing(item);
    setViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setViewing(null);
    setViewOpen(false);
  }, []);

  const openDelete = useCallback((item: Designation) => {
    setDeleting(item);
    setDeleteOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    setDeleting(null);
    setDeleteOpen(false);
  }, []);

  const refresh = useCallback(async () => {
    await dispatch(fetchDesignations({ sortBy: "createdAt", sortOrder: "desc" })).unwrap();
  }, [dispatch]);

  const handleFormSubmit = useCallback(
    async (vals: DesignationFormData) => {
      try {
        if (editing) {
          await dispatch(updateDesignation({ id: editing._id, data: vals }) as any).unwrap();
          toast.success("Designation updated successfully!");
        } else {
          await dispatch(createDesignation(vals) as any).unwrap();
          toast.success("Designation created successfully!");
        }
        closeForm();
        await refresh();
      } catch {
        toast.error(editing ? "Failed to update designation" : "Failed to create designation");
      }
    },
    [dispatch, editing, closeForm, refresh]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteDesignation(deleting._id) as any).unwrap();
      toast.success("Designation deleted successfully!");
      closeDelete();
      await refresh();
    } catch {
      toast.error("Failed to delete designation");
    }
  }, [dispatch, deleting, closeDelete, refresh]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `designations_${new Date().toISOString().split("T")[0]}.csv`,
      });
      toast.success("Designations exported successfully!");
    }
  }, [gridApi]);

  // grid defs
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Designation",
        field: "name",
        flex: 2,
        minWidth: 220,
        sortable: true,
        filter: true,
        cellRenderer: (p: ICellRendererParams) => {
          const item = p.data as Designation;
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                {item.name}
              </Typography>
              {item.description && (
                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mt: 0.5 }}>
                  {item.description.length > 60
                    ? `${item.description.substring(0, 60)}...`
                    : item.description}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        headerName: "Department",
        field: "departmentId",
        flex: 1.5,
        minWidth: 180,
        valueGetter: (p) => getDeptName((p.data as Designation).departmentId),
      },
      {
        headerName: "Created",
        field: "createdAt",
        flex: 1.2,
        minWidth: 130,
        valueFormatter: (p) => formatDate(p.value),
      },
      {
        headerName: "Updated",
        field: "updatedAt",
        flex: 1.2,
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
    [getDeptName]
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
      onEdit: openEdit,
      onDelete: openDelete,
      onView: openView,
      getDeptName, // pass for quick access in action renderer
    }),
    [openEdit, openDelete, openView, getDeptName]
  );

  // initial form values (always DesignationFormData)
  const formInitialValues = useMemo<DesignationFormData>(() => {
    return editing
      ? {
          departmentId: editing.departmentId || "",
          name: editing.name,
          description: editing.description || "",
        }
      : INITIAL_FORM;
  }, [editing]);

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
          Designation Management
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
            onClick={openAdd}
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
            Add Designation
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 220,
            p: 2.5,
            border: "1px solid #e5e7eb",
            borderLeft: "4px solid #3b82f6",
            transition: "all 0.2s",
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Total Designations
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.total}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 220,
            p: 2.5,
            border: "1px solid #e5e7eb",
            borderLeft: "4px solid #10b981",
            transition: "all 0.2s",
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Departments Covered
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.uniqueDeptCount}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 220,
            p: 2.5,
            border: "1px solid #e5e7eb",
            borderLeft: "4px solid #2563eb",
            transition: "all 0.2s",
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Added in Last 30 Days
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.recentCount}
          </Typography>
        </Paper>
      </Box>

      {/* Search Bar */}
      <Paper elevation={0} sx={{ mb: 3, border: "1px solid #e5e7eb", "&:focus-within": { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.1)" } }}>
        <TextField
          fullWidth
          placeholder="Search designations by name, department, or description..."
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
              No designations found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch ? "Try adjusting your search terms" : "Click 'Add Designation' to create your first designation"}
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAdd}
                sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
              >
                Add Designation
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
      <DesignationFormModal
        open={formOpen}
        isEdit={!!editing}
        initialValues={formInitialValues}
        isSubmitting={isLoading}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        departments={departments as Department[]}
      />

      <DesignationViewModal
        open={viewOpen}
        designation={viewing}
        departments={departments as Department[]}
        onClose={closeView}
      />

      <DesignationDeleteModal
        open={deleteOpen}
        itemName={deleting?.name}
        isLoading={isLoading}
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
