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
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from "ag-grid-community";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../../../store/actions/projectActions";
import { toast } from "react-toastify";
import { ProjectFormModal, ProjectDeleteModal, ProjectViewModal } from "./ProjectManagementModals";
import type { Project, ProjectFormData } from "../../../../utils/interfaces/projectInterface";
import { useDebounced } from "../../../../utils/common/helpers";

// -------------------- Constants & Helpers --------------------

const initialFormValues: ProjectFormData = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: 1,
};

const toInputDate = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10); // yyyy-MM-dd
};

const projectToFormData = (p: Project): ProjectFormData => ({
  name: p.name ?? "",
  description: p.description ?? "",
  startDate: toInputDate(p.startDate),
  endDate: toInputDate(p.endDate),
  status: (p.status ?? 1) as 0 | 1 | 2 | 3,
});

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
  const s = props.value ?? 1;
  const statusMap: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: "Inactive", color: "#dc2626", bg: alpha("#ef4444", 0.1) },
    1: { label: "Active", color: "#059669", bg: alpha("#10b981", 0.1) },
    2: { label: "Completed", color: "#2563eb", bg: alpha("#3b82f6", 0.1) },
    3: { label: "Cancelled", color: "#92400e", bg: alpha("#f59e0b", 0.1) },
  };
  const sData = statusMap[s] || statusMap[1];

  return (
    <Chip
      label={sData.label}
      size="small"
      sx={{
        bgcolor: sData.bg,
        color: sData.color,
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
  const project = props.data as Project;

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="View">
        <IconButton
          size="small"
          onClick={() => onView(project)}
          sx={{ color: "#6b7280", "&:hover": { color: "#10b981", bgcolor: alpha("#10b981", 0.1) } }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => onEdit(project)}
          sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) } }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => onDelete(project)}
          sx={{ color: "#6b7280", "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// -------------------- Main Component --------------------

const ProjectManagement = () => {
  const dispatch = useAppDispatch();
  const { projects, isLoading, error } = useAppSelector((s) => s.project);

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm.trim().toLowerCase(), 400);

  // modals & selection
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // grid
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const gridRef = useRef<AgGridReact>(null);

  // fetch
  useEffect(() => {
    dispatch(fetchProjects({ sortBy: "createdAt", sortOrder: "desc" }))
      .unwrap()
      .catch(() => toast.error("Failed to fetch projects"));
  }, [dispatch]);

  // stats
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 1).length;
    const completed = projects.filter((p) => p.status === 2).length;
    return { total, active, completed };
  }, [projects]);

  // form initial values (ALWAYS ProjectFormData)
  const formInitialValues = useMemo<ProjectFormData>(() => {
    return editingProject ? projectToFormData(editingProject) : initialFormValues;
  }, [editingProject]);

  // handlers
  const handleOpenAdd = useCallback(() => {
    setEditingProject(null);
    setOpenFormModal(true);
  }, []);

  const handleOpenEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setOpenFormModal(true);
  }, []);

  const handleOpenView = useCallback((project: Project) => {
    setSelectedProject(project);
    setOpenViewModal(true);
  }, []);

  const handleOpenDelete = useCallback((project: Project) => {
    setSelectedProject(project);
    setOpenDeleteModal(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setOpenFormModal(false);
    setOpenDeleteModal(false);
    setOpenViewModal(false);
    setEditingProject(null);
    setSelectedProject(null);
  }, []);

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await dispatch(deleteProject(selectedProject._id)).unwrap();
      toast.success("Project deleted successfully!");
      await dispatch(fetchProjects({ sortBy: "createdAt", sortOrder: "desc" })).unwrap();
      handleCloseModals();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `projects_${new Date().toISOString().split("T")[0]}.csv`,
      });
      toast.success("Projects exported successfully!");
    }
  }, [gridApi]);

  const filtered = useMemo(() => {
    const q = debouncedSearch;
    if (!q) return projects;
    return projects.filter((p) =>
      [p.name, p.description, p.addedBy?.name, String(p.status)]
        .map((v) => (v || "").toString().toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [projects, debouncedSearch]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      {
        headerName: "Project Name",
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
          p.value ? `${p.value.substring(0, 50)}${p.value.length > 50 ? "..." : ""}` : "-",
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
    ];
  }, []);

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
      onEdit: handleOpenEdit,
      onDelete: handleOpenDelete,
      onView: handleOpenView,
    }),
    [handleOpenEdit, handleOpenDelete, handleOpenView]
  );

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
          Project Management
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
            onClick={handleOpenAdd}
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
            Add Project
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
            Total Projects
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
            Active Projects
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
            borderLeft: "4px solid #2563eb",
            transition: "all 0.2s",
            "&:hover": { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
          }}
        >
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 0.5, fontWeight: 500 }}>
            Completed Projects
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
            {stats.completed}
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
          placeholder="Search projects by name, description, or status..."
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
              No projects found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch ? "Try adjusting your search terms" : "Click 'Add Project' to create your first project"}
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
              >
                Add Project
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
      <ProjectFormModal
        isOpen={openFormModal}
        isEdit={!!editingProject}
        initialValues={formInitialValues} // ✅ always ProjectFormData
        isLoading={isLoading}
        onClose={handleCloseModals}
        onSubmit={async (values) => {
          try {
            if (editingProject) {
              await dispatch(updateProject({ id: editingProject._id, data: values })).unwrap();
              toast.success("Project updated successfully!");
            } else {
              await dispatch(createProject(values)).unwrap();
              toast.success("Project created successfully!");
            }
            await dispatch(fetchProjects({ sortBy: "createdAt", sortOrder: "desc" })).unwrap();
            handleCloseModals();
          } catch {
            toast.error(editingProject ? "Failed to update project" : "Failed to create project");
          }
        }}
      />

      <ProjectDeleteModal
        isOpen={openDeleteModal}
        projectName={selectedProject?.name || ""}
        isLoading={isLoading}
        onCancel={handleCloseModals}
        onConfirm={handleDelete}
      />

      <ProjectViewModal isOpen={openViewModal} project={selectedProject} onClose={handleCloseModals} />
    </Box>
  );
};

export default ProjectManagement;
