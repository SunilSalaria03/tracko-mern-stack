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
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
} from "ag-grid-community";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchWorkstreams,
  createWorkstream,
  updateWorkstream,
  deleteWorkstream,
} from "../../../../store/actions/workstreamActions";
import type {
  Workstream,
  WorkstreamFormData,
} from "../../../../utils/interfaces/workstreamInterface";
import { toast } from "react-toastify";
import {
  WorkstreamFormModal,
  WorkstreamViewModal,
  WorkstreamDeleteModal,
} from "./WorkstreamManagementModals";

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
const INITIAL_FORM: WorkstreamFormData = {
  name: "",
  description: "",
  status: 1,
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
const StatusCellRenderer = (props: ICellRendererParams) => {
  const val = Number(props.value ?? 1);
  const isActive = val === 1;
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
  const ws = props.data as Workstream;
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="View">
        <IconButton
          size="small"
          onClick={() => onView(ws)}
          sx={{
            color: "#6b7280",
            "&:hover": { color: "#10b981", bgcolor: alpha("#10b981", 0.1) },
          }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => onEdit(ws)}
          sx={{
            color: "#6b7280",
            "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => onDelete(ws)}
          sx={{
            color: "#6b7280",
            "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// -------------------- Main Component --------------------
const WorkstreamManagement = () => {
  const dispatch = useAppDispatch();
  const { workstreams, isLoading, error } = useAppSelector(
    (s) => s.workstream
  );

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm.trim().toLowerCase(), 400);

  // modals & selection
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Workstream | null>(null);
  const [viewing, setViewing] = useState<Workstream | null>(null);
  const [deleting, setDeleting] = useState<Workstream | null>(null);

  // grid
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const gridRef = useRef<AgGridReact>(null);

  // fetch all (client-side filtering & pagination via AG Grid)
  useEffect(() => {
    dispatch(fetchWorkstreams({ sortBy: "createdAt", sortOrder: "desc" }))
      .unwrap()
      .catch(() => toast.error("Failed to fetch workstreams"));
  }, [dispatch]);

  // error toast
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // stats
  const stats = useMemo(() => {
    const total = workstreams.length;
    const active = workstreams.filter((w) => Number(w.status) === 1).length;
    const inactive = workstreams.filter((w) => Number(w.status) !== 1).length;
    return { total, active, inactive };
  }, [workstreams]);

  // filtered rows
  const filtered = useMemo(() => {
    const q = debouncedSearch;
    if (!q) return workstreams;
    return workstreams.filter((w) =>
      [w.name, w.description, String(w.status)]
        .map((v) => (v || "").toString().toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [workstreams, debouncedSearch]);

  // handlers
  const openAdd = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((ws: Workstream) => {
    setEditing(ws);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const openView = useCallback((ws: Workstream) => {
    setViewing(ws);
    setViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setViewing(null);
    setViewOpen(false);
  }, []);

  const openDelete = useCallback((ws: Workstream) => {
    setDeleting(ws);
    setDeleteOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    setDeleting(null);
    setDeleteOpen(false);
  }, []);

  const refresh = useCallback(async () => {
    await dispatch(fetchWorkstreams({ sortBy: "createdAt", sortOrder: "desc" })).unwrap();
  }, [dispatch]);

  const handleFormSubmit = useCallback(
    async (vals: WorkstreamFormData) => {
      try {
        if (editing) {
          await dispatch(updateWorkstream({ id: editing._id, data: vals })).unwrap();
          toast.success("Workstream updated successfully!");
        } else {
          await dispatch(createWorkstream(vals)).unwrap();
          toast.success("Workstream created successfully!");
        }
        closeForm();
        await refresh();
      } catch {
        toast.error(editing ? "Failed to update workstream" : "Failed to create workstream");
      }
    },
    [dispatch, editing, closeForm, refresh]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteWorkstream(deleting._id)).unwrap();
      toast.success("Workstream deleted successfully!");
      closeDelete();
      await refresh();
    } catch {
      toast.error("Failed to delete workstream");
    }
  }, [dispatch, deleting, closeDelete, refresh]);

  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `workstreams_${new Date().toISOString().split("T")[0]}.csv`,
      });
      toast.success("Workstreams exported successfully!");
    }
  }, [gridApi]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  // grid defs
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Workstream Name",
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
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 110,
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "Created",
        field: "createdAt",
        flex: 1.3,
        minWidth: 130,
        valueFormatter: (p) => formatDate(p.value),
      },
      {
        headerName: "Updated",
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
      onEdit: openEdit,
      onDelete: openDelete,
      onView: openView,
    }),
    [openEdit, openDelete, openView]
  );

  // initial values for modal
  const formValues = useMemo<WorkstreamFormData>(() => {
    return editing
      ? {
          name: editing.name,
          description: editing.description || "",
          status: (editing.status ?? 1) as 0 | 1,
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
          Workstream Management
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
            Add Workstream
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
            Total Workstreams
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
            Active Workstreams
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
            Inactive Workstreams
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.inactive}
          </Typography>
        </Paper>
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid #e5e7eb",
          transition: "all 0.2s",
          "&:focus-within": { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.1)" },
        }}
      >
        <TextField
          fullWidth
          placeholder="Search workstreams by name, description, or status..."
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
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              "& fieldset": { border: "none" },
            },
          }}
        />
      </Paper>

      {/* AG Grid */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}
      >
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
              No workstreams found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch ? "Try adjusting your search terms" : "Click 'Add Workstream' to create your first workstream"}
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAdd}
                sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
              >
                Add Workstream
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
      <WorkstreamFormModal
        open={formOpen}
        isEdit={!!editing}
        initialValues={formValues}
        isSubmitting={isLoading}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        showStatusSelect
      />

      <WorkstreamViewModal open={viewOpen} workstream={viewing} onClose={closeView} />

      <WorkstreamDeleteModal
        open={deleteOpen}
        workstreamName={deleting?.name}
        isLoading={isLoading}
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default WorkstreamManagement;
