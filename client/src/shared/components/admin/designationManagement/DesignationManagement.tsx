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

function useDebounced<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const INITIAL_FORM: DesignationFormData = {
  departmentId: "",
  name: "",
  description: "",
};

export default function DesignationManagement() {
  const dispatch = useAppDispatch();

  const { designations, total, isLoading, error } = useAppSelector(
    (s) => s.designationManagement
  );
  const { departments } = useAppSelector(
    (s) => s.departmentManagement || { departments: [] }
  );

   const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 500);

   const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

   const [editing, setEditing] = useState<Designation | null>(null);
  const [viewing, setViewing] = useState<Designation | null>(null);
  const [deleting, setDeleting] = useState<Designation | null>(null);

  const [formValues, setFormValues] =
    useState<DesignationFormData>(INITIAL_FORM);
   useEffect(() => {
    dispatch(
      fetchDesignations({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch.trim(),
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  }, [dispatch, page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    if (!departments || departments.length === 0) {
      dispatch(
        fetchDepartments({
          page: 1,
          limit: 100,
          sortBy: "name",
          sortOrder: "asc",
        }) as any
      );
    }
  }, [dispatch]);

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

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  /* open/close handlers */
  const openAdd = () => {
    setEditing(null);
    setFormValues(INITIAL_FORM);
    setFormOpen(true);
  };
  const openEdit = (item: Designation) => {
    setEditing(item);
    setFormValues({
      departmentId: item.departmentId || "",
      name: item.name,
      description: item.description || "",
    });
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const openView = (item: Designation) => {
    setViewing(item);
    setViewOpen(true);
  };
  const closeView = () => {
    setViewing(null);
    setViewOpen(false);
  };

  const openDelete = (item: Designation) => {
    setDeleting(item);
    setDeleteOpen(true);
  };
  const closeDelete = () => {
    setDeleting(null);
    setDeleteOpen(false);
  };

  /* submit handlers */
  const refresh = () =>
    dispatch(
      fetchDesignations({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch.trim(),
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );

  const handleFormSubmit = async (vals: DesignationFormData) => {
    try {
      if (editing) {
        await dispatch(
          updateDesignation({ id: editing._id, data: vals }) as any
        ).unwrap();
        toast.success("Designation updated successfully!");
      } else {
        await dispatch(createDesignation(vals) as any).unwrap();
        toast.success("Designation created successfully!");
      }
      closeForm();
      refresh();
    } catch {
      toast.error(
        editing
          ? "Failed to update designation"
          : "Failed to create designation"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteDesignation(deleting._id) as any).unwrap();
      toast.success("Designation deleted successfully!");
      closeDelete();
      refresh();
    } catch {
      toast.error("Failed to delete designation");
    }
  };

  const list = useMemo(() => designations, [designations]);

  const getDeptName = (deptId?: string) => {
    return deptId?.name || "-";
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
            Designation Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Map designations to departments and manage role titles
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
          Add Designation
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
          placeholder="Search designations by name or department..."
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
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
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

        {!isLoading && !error && list.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No designations found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {debouncedSearch
                ? "Try adjusting your search terms"
                : "Click 'Add Designation' to create your first designation"}
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
                Add Designation
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
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Designation
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Created
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                      Updated
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
                  {list.map((item) => (
                    <TableRow
                      key={item._id}
                      sx={{
                        "&:hover": { bgcolor: alpha("#3b82f6", 0.05) },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1f2937" }}
                          >
                            {item.name}
                          </Typography>
                          {item.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              {item.description.length > 60
                                ? `${item.description.substring(0, 60)}...`
                                : item.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#374151" }}>
                        {getDeptName(item.departmentId)}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>
                        {formatDate(item.updatedAt)}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => openView(item)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": {
                                  color: "#111827",
                                  bgcolor: alpha("#111827", 0.06),
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => openEdit(item)}
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
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => openDelete(item)}
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
              sx={{ borderTop: "1px solid #e5e7eb" }}
            />
          </>
        )}
      </Paper>

      <DesignationFormModal
        open={formOpen}
        isEdit={!!editing}
        initialValues={formValues}
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
