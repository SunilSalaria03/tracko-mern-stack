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
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../../../store/actions/projectActions";
import type {
  Project,
  ProjectFormData,
} from "../../../../utils/interfaces/projectInterface";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { projectValidationSchema } from "../../../../utils/validations/ProjectValidations";

const initialFormValues: ProjectFormData = {
  name: "",
  code: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "active",
  clientName: "",
  budget: 0,
};

const ProjectManagement = () => {
  const dispatch = useAppDispatch();
  const { projects, total, isLoading, error } =
    useAppSelector((state) => state.project);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // Formik
  const formik = useFormik<ProjectFormData>({
    initialValues: initialFormValues,
    validationSchema: projectValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        if (isEdit && selectedProject) {
          await dispatch(
            updateProject({
              id: selectedProject._id,
              data: values,
            })
          ).unwrap();
          toast.success("Project updated successfully!");
        } else {
          await dispatch(createProject(values)).unwrap();
          toast.success("Project created successfully!");
        }
        handleCloseFormModal();
        resetForm();
      } catch (err) {
        toast.error(
          isEdit ? "Failed to update project" : "Failed to create project"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && selectedProject) {
      formik.setValues({
        name: selectedProject.name,
        code: selectedProject.code,
        description: selectedProject.description || "",
        startDate: selectedProject.startDate
          ? new Date(selectedProject.startDate).toISOString().split("T")[0]
          : "",
        endDate: selectedProject.endDate
          ? new Date(selectedProject.endDate).toISOString().split("T")[0]
          : "",
        status: selectedProject.status,
        clientName: selectedProject.clientName || "",
        budget: selectedProject.budget || 0,
      });
    } else {
      formik.setValues(initialFormValues);
    }
    // eslint-disable-next-line
  }, [openFormModal, isEdit, selectedProject]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      fetchProjects({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  }, [dispatch, page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Modal handlers
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
    formik.resetForm();
  };

  const handleOpenDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await dispatch(deleteProject(selectedProject._id)).unwrap();
      toast.success("Project deleted successfully!");
      handleCloseDeleteModal();
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "active":
        return "success";
      case "on-hold":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
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
            "&:hover": {
              bgcolor: "#059669",
            },
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
      </Paper>

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

        {!isLoading && !error && projects.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No projects found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "Click 'Add Project' to create your first project"}
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
                  "&:hover": {
                    bgcolor: "#059669",
                  },
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
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Project Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Code
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Client
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Start Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      End Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Budget
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
                  {projects.map((project) => (
                    <TableRow
                      key={project._id}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha("#3b82f6", 0.05),
                        },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1f2937" }}
                          >
                            {project.name}
                          </Typography>
                          {project.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              {project.description.length > 50
                                ? `${project.description.substring(0, 50)}...`
                                : project.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.code}
                          size="small"
                          sx={{
                            bgcolor: alpha("#3b82f6", 0.1),
                            color: "#3b82f6",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {project.clientName || "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          size="small"
                          color={getStatusColor(project.status)}
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {formatDate(project.startDate)}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {formatDate(project.endDate)}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280", fontWeight: 600 }}>
                        {formatCurrency(project.budget)}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Tooltip title="Edit Project">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(project)}
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
                          <Tooltip title="Delete Project">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteModal(project)}
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
              sx={{
                borderTop: "1px solid #e5e7eb",
              }}
            />
          </>
        )}
      </Paper>

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
            {isEdit ? "Edit Project" : "Add New Project"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Project Name"
              fullWidth
              required
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              placeholder="Enter project name"
            />
            <TextField
              label="Project Code"
              fullWidth
              required
              id="code"
              name="code"
              value={formik.values.code}
              onChange={(e) => formik.setFieldValue("code", e.target.value.toUpperCase())}
              onBlur={formik.handleBlur}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code ? formik.errors.code : "E.g., PROJ-2024-001"}
              placeholder="Enter project code"
            />
            <TextField
              label="Client Name"
              fullWidth
              id="clientName"
              name="clientName"
              value={formik.values.clientName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter client name"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter project description"
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                id="startDate"
                name="startDate"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                id="endDate"
                name="endDate"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                label="Status"
                fullWidth
                id="status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on-hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
              <TextField
                label="Budget"
                type="number"
                fullWidth
                id="budget"
                name="budget"
                value={formik.values.budget}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.budget && Boolean(formik.errors.budget)}
                helperText={formik.touched.budget && formik.errors.budget}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 100 }}
              />
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
            onClick={formik.submitForm}
            variant="contained"
            type="submit"
            disabled={isLoading || formik.isSubmitting}
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
            {isLoading || formik.isSubmitting ? (
              <CircularProgress size={20} />
            ) : isEdit ? (
              "Update Project"
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
            Delete Project
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
            Are you sure you want to delete this project?
          </Typography>
          {selectedProject && (
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
                {selectedProject.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                Code: {selectedProject.code}
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
            {isLoading ? <CircularProgress size={20} /> : "Delete Project"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;

