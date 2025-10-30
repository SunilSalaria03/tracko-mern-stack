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

const WorkstreamManagement = () => {
  const dispatch = useAppDispatch();
  const { workstreams, total, isLoading, error } = useAppSelector(
    (state) => state.workstream
  );

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedWorkstream, setSelectedWorkstream] =
    useState<Workstream | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WorkstreamFormData>({
    name: "",
    code: "",
    description: "",
    status: "active",
    teamLead: "",
    startDate: "",
    endDate: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch workstreams when filters change
  useEffect(() => {
    dispatch(
      fetchWorkstreams({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  }, [dispatch, page, rowsPerPage, debouncedSearch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Workstream name is required";
    }

    if (!formData.code.trim()) {
      errors.code = "Workstream code is required";
    } else if (!/^[A-Z0-9-]+$/i.test(formData.code)) {
      errors.code =
        "Workstream code should only contain letters, numbers, and hyphens";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setIsEdit(false);
    setSelectedWorkstream(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "active",
      teamLead: "",
      startDate: "",
      endDate: "",
    });
    setFormErrors({});
    setOpenFormModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (workstream: Workstream) => {
    setIsEdit(true);
    setSelectedWorkstream(workstream);
    setFormData({
      name: workstream.name,
      code: workstream.code,
      description: workstream.description || "",
      status: workstream.status,
      teamLead: workstream.teamLead || "",
      startDate: workstream.startDate
        ? new Date(workstream.startDate).toISOString().split("T")[0]
        : "",
      endDate: workstream.endDate
        ? new Date(workstream.endDate).toISOString().split("T")[0]
        : "",
    });
    setFormErrors({});
    setOpenFormModal(true);
  };

  // Close form modal
  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setSelectedWorkstream(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "active",
      teamLead: "",
      startDate: "",
      endDate: "",
    });
    setFormErrors({});
  };

  // Handle form change
  const handleFormChange = (field: keyof WorkstreamFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEdit && selectedWorkstream) {
        await dispatch(
          updateWorkstream({
            id: selectedWorkstream._id,
            data: formData,
          })
        ).unwrap();
        toast.success("Workstream updated successfully!");
      } else {
        await dispatch(createWorkstream(formData)).unwrap();
        toast.success("Workstream created successfully!");
      }
      handleCloseFormModal();
    } catch (err) {
      toast.error(
        isEdit ? "Failed to update workstream" : "Failed to create workstream"
      );
    }
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (workstream: Workstream) => {
    setSelectedWorkstream(workstream);
    setOpenDeleteModal(true);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedWorkstream(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedWorkstream) return;

    try {
      await dispatch(deleteWorkstream(selectedWorkstream._id)).unwrap();
      toast.success("Workstream deleted successfully!");
      handleCloseDeleteModal();
    } catch (err) {
      toast.error("Failed to delete workstream");
    }
  };

  // Get status color
  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  // Format date
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
            Workstream Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Manage and track all your workstreams
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
          Add Workstream
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
          placeholder="Search workstreams by name, code, or team lead..."
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

        {!isLoading && !error && workstreams.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No workstreams found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "Click 'Add Workstream' to create your first workstream"}
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
                Add Workstream
              </Button>
            )}
          </Box>
        )}

        {!isLoading && !error && workstreams.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Workstream Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Code
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Team Lead
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
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "#374151" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workstreams.map((workstream) => (
                    <TableRow
                      key={workstream._id}
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
                            {workstream.name}
                          </Typography>
                          {workstream.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              {workstream.description.length > 50
                                ? `${workstream.description.substring(0, 50)}...`
                                : workstream.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={workstream.code}
                          size="small"
                          sx={{
                            bgcolor: alpha("#3b82f6", 0.1),
                            color: "#3b82f6",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {workstream.teamLead || "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={workstream.status}
                          size="small"
                          color={getStatusColor(workstream.status)}
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {formatDate(workstream.startDate)}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {formatDate(workstream.endDate)}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="Edit Workstream">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(workstream)}
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
                          <Tooltip title="Delete Workstream">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteModal(workstream)}
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

            {/* Pagination */}
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

      {/* Add/Edit Form Modal */}
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
            {isEdit ? "Edit Workstream" : "Add New Workstream"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Workstream Name */}
            <TextField
              label="Workstream Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              placeholder="Enter workstream name"
            />

            {/* Description */}
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="Enter workstream description"
            />

            {/* Status */}
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => handleFormChange("status", e.target.value)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
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
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
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
            {isLoading ? (
              <CircularProgress size={20} />
            ) : isEdit ? (
              "Update Workstream"
            ) : (
              "Create Workstream"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
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
            Delete Workstream
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
            Are you sure you want to delete this workstream?
          </Typography>
          {selectedWorkstream && (
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
                {selectedWorkstream.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                Code: {selectedWorkstream.code}
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
            {isLoading ? <CircularProgress size={20} /> : "Delete Workstream"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkstreamManagement;
