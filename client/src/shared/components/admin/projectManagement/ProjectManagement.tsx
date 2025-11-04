import { useState, useEffect, useCallback } from "react";
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
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../../../store/actions/projectActions";
import type { Project, ProjectFormData } from "../../../../utils/interfaces/projectInterface";
import { toast } from "react-toastify";
import { ProjectFormModal, ProjectDeleteModal, ProjectViewModal } from "./ProjectManagementModals.tsx";

const initialFormValues: ProjectFormData = { name: "", description: "", startDate: "", endDate: "", status: 1 };

const ProjectManagement = () => {
  const dispatch = useAppDispatch();
  const { projects, total, isLoading, error } = useAppSelector((state) => state.project);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProjectsData = useCallback(
    async (opts?: { page?: number; limit?: number; search?: string }) => {
      const effectivePage = (opts?.page ?? page) + 1;
      const effectiveLimit = opts?.limit ?? rowsPerPage;
      const effectiveSearch = opts?.search ?? debouncedSearch;

      try {
        await dispatch(
          fetchProjects({
            page: effectivePage,
            perPageLimit: effectiveLimit,
            search: effectiveSearch,
            sortBy: "createdAt",
            sortOrder: "desc",
          })
        ).unwrap();
      } catch {
        toast.error("Failed to fetch projects");
      }
    },
    [dispatch, page, rowsPerPage, debouncedSearch]
  );

  useEffect(() => {
    fetchProjectsData();
  }, [page, rowsPerPage, debouncedSearch]);

  const getProjectInitialValues = (): ProjectFormData => {
    if (isEdit && selectedProject) {
      const start = selectedProject.startDate ? new Date(selectedProject.startDate) : undefined;
      const end = selectedProject.endDate ? new Date(selectedProject.endDate) : undefined;
      const toInputDate = (d?: Date) => (d ? d.toISOString().slice(0, 10) : "");
      return {
        name: selectedProject.name,
        description: selectedProject.description || "",
        startDate: toInputDate(start),
        endDate: toInputDate(end),
        status: (selectedProject.status ?? 1) as 0 | 1 | 2 | 3,
      };
    }
    return initialFormValues;
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setSelectedProject(null);
    setOpenFormModal(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setIsEdit(true);
    setSelectedProject(project);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setSelectedProject(null);
  };

  const handleOpenDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedProject(null);
  };

  const handleOpenViewModal = (project: Project) => {
    setSelectedProject(project);
    setOpenViewModal(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await dispatch(deleteProject(selectedProject._id)).unwrap();
      toast.success("Project deleted successfully!");

      const isLastRowOnPage = projects.length === 1 && page > 0;
      const nextPage = isLastRowOnPage ? page - 1 : page;
      if (isLastRowOnPage) setPage(nextPage);
      await fetchProjectsData({ page: nextPage });
      handleCloseDeleteModal();
    } catch {
      toast.error("Failed to delete project");
    }
  };

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
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1f2937", mb: 1 }}>
            Project Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Manage and track all your projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
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
          Add Project
        </Button>
      </Box>

      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
          placeholder="Search projects by name, code, or client..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#6b7280" }} />
              </InputAdornment>
            ),
            endAdornment: !!searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")} sx={{ color: "#6b7280" }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
        />
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No projects found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {searchTerm ? "Try adjusting your search terms" : "Click 'Add Project' to create your first project"}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal}
                sx={{
                  bgcolor: "#10b981",
                  color: "white",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                Add Project
              </Button>
            )}
          </Box>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>S.No</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Project Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Added By</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Updated Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project, index) => (
                    <TableRow
                      key={project._id}
                      sx={{
                        "&:hover": { bgcolor: alpha("#3b82f6", 0.05) },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                            {project.name}
                          </Typography>
                          {project.description && (
                            <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mt: 0.5 }}>
                              {project.description.length > 50
                                ? `${project.description.substring(0, 50)}...`
                                : project.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{project.addedBy?.name || "-"}</TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {(() => {
                          const s = project.status ?? 1;
                          return s === 0 ? "Inactive" : s === 1 ? "Active" : s === 2 ? "Completed" : s === 3 ? "Cancelled" : "-";
                        })()}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>{formatDate(project.createdAt)}</TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>{formatDate(project.updatedAt)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Tooltip title="View Project">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenViewModal(project)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Project">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(project)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Project">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteModal(project)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) },
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

      <ProjectFormModal
        isOpen={openFormModal}
        isEdit={isEdit}
        initialValues={getProjectInitialValues()}
        isLoading={isLoading}
        onClose={handleCloseFormModal}
        onSubmit={async (values: ProjectFormData) => {
          try {
            if (isEdit && selectedProject) {
              await dispatch(updateProject({ id: selectedProject._id, data: values })).unwrap();
              toast.success("Project updated successfully!");
              await fetchProjectsData();
            } else {
              await dispatch(createProject(values)).unwrap();
              toast.success("Project created successfully!");
              setPage(0);
              await fetchProjectsData({ page: 0 });
            }
            handleCloseFormModal();
          } catch {
            toast.error(isEdit ? "Failed to update project" : "Failed to create project");
          }
        }}
      />

      <ProjectDeleteModal
        isOpen={openDeleteModal}
        projectName={selectedProject?.name || ""}
        isLoading={isLoading}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleDelete}
      />

      <ProjectViewModal
        isOpen={openViewModal}
        project={selectedProject}
        onClose={handleCloseViewModal}
      />
    </Box>
  );
};

export default ProjectManagement;
