import { useState, useEffect, useMemo } from "react";
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

function useDebounced<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const INITIAL_FORM: WorkstreamFormData = {
  name: "",
  description: "",
  status: 1,
};

const WorkstreamManagement = () => {
  const dispatch = useAppDispatch();
  const { workstreams, total, isLoading, error } = useAppSelector(
    (s) => s.workstream
  );

   const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 500);

   const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

   const [editing, setEditing] = useState<Workstream | null>(null);
  const [viewing, setViewing] = useState<Workstream | null>(null);
  const [deleting, setDeleting] = useState<Workstream | null>(null);

   const [formValues, setFormValues] = useState<WorkstreamFormData>(INITIAL_FORM);

   useEffect(() => {
    dispatch(
      fetchWorkstreams({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch.trim(),
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  }, [dispatch, page, rowsPerPage, debouncedSearch]);

   useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const getStatusColor = (status: number) => (status === 1 ? "success" : "warning");

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const openAdd = () => {
    setEditing(null);
    setFormValues(INITIAL_FORM);
    setFormOpen(true);
  };

  const openEdit = (ws: Workstream) => {
    setEditing(ws);
    setFormValues({
      name: ws.name,
      description: ws.description || "",
      status: ws.status ?? 1,
    });
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const openView = (ws: Workstream) => {
    setViewing(ws);
    setViewOpen(true);
  };
  const closeView = () => {
    setViewing(null);
    setViewOpen(false);
  };

  const openDelete = (ws: Workstream) => {
    setDeleting(ws);
    setDeleteOpen(true);
  };
  const closeDelete = () => {
    setDeleting(null);
    setDeleteOpen(false);
  };

  const refresh = () =>
    dispatch(
      fetchWorkstreams({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch.trim(),
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );

  const handleFormSubmit = async (vals: WorkstreamFormData) => {
    try {
      if (editing) {
        await dispatch(updateWorkstream({ id: editing._id, data: vals })).unwrap();
        toast.success("Workstream updated successfully!");
      } else {
        await dispatch(createWorkstream(vals)).unwrap();
        toast.success("Workstream created successfully!");
      }
      closeForm();
      refresh();
    } catch {
      toast.error(editing ? "Failed to update workstream" : "Failed to create workstream");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteWorkstream(deleting._id)).unwrap();
      toast.success("Workstream deleted successfully!");
      closeDelete();
      refresh();
    } catch {
      toast.error("Failed to delete workstream");
    }
  };

  const list = useMemo(() => workstreams, [workstreams]);

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1f2937", mb: 1 }}>
            Workstream Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Manage and track all your workstreams
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
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
          Add Workstream
        </Button>
      </Box>

      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
          placeholder="Search workstreams by name or description..."
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

        {!isLoading && !error && list.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No workstreams found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch
                ? "Try adjusting your search terms"
                : "Click 'Add Workstream' to create your first workstream"}
            </Typography>
            {!debouncedSearch && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAdd}
                sx={{
                  bgcolor: "#10b981",
                  color: "white",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                Add Workstream
              </Button>
            )}
          </Box>
        )}

        {!isLoading && !error && list.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Workstream Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Updated</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((ws) => (
                    <TableRow
                      key={ws._id}
                      sx={{
                        "&:hover": { bgcolor: alpha("#3b82f6", 0.05) },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                            {ws.name}
                          </Typography>
                          {ws.description && (
                            <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mt: 0.5 }}>
                              {ws.description.length > 50
                                ? `${ws.description.substring(0, 50)}...`
                                : ws.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={Number(ws.status) === 1 ? "Active" : "Inactive"}
                          size="small"
                          color={getStatusColor(Number(ws.status))}
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>

                      <TableCell sx={{ color: "#6b7280" }}>{formatDate(ws.createdAt)}</TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>{formatDate(ws.updatedAt)}</TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => openView(ws)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": { color: "#111827", bgcolor: alpha("#111827", 0.06) },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => openEdit(ws)}
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
                              onClick={() => openDelete(ws)}
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
