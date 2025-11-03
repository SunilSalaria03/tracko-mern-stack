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
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../../store/actions/departmentActions";
import type { Department, DepartmentFormData } from "../../../../utils/interfaces/departmentInterface";
import { toast } from "react-toastify";
import {
  DepartmentFormModal,
  DepartmentDeleteModal,
  DepartmentViewModal,
} from "./DepartmentManagementModals";

const initialFormValues: DepartmentFormData = {
  name: "",
  description: "",
  status: 1,
};

const DepartmentManagement = () => {
  const dispatch = useAppDispatch();
  const { departments, total, isLoading, error } = useAppSelector((state) => state.departmentManagement);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchDepartmentsData = useCallback(
    async (opts?: { page?: number; limit?: number; search?: string }) => {
      const effectivePage = (opts?.page ?? page) + 1;
      const effectiveLimit = opts?.limit ?? rowsPerPage;
      const effectiveSearch = opts?.search ?? debouncedSearch;

      try {
        await dispatch(
          fetchDepartments({
            page: effectivePage,
            limit: effectiveLimit,
            search: effectiveSearch,
            sortBy: "createdAt",
            sortOrder: "desc",
          })
        ).unwrap();
      } catch {
        toast.error("Failed to fetch departments");
      }
    },
    [dispatch, page, rowsPerPage, debouncedSearch]
  );

  useEffect(() => {
    fetchDepartmentsData();
  }, [page, rowsPerPage, debouncedSearch, fetchDepartmentsData]);

  const getDepartmentInitialValues = (): DepartmentFormData => {
    if (isEdit && selectedDepartment) {
      return {
        name: selectedDepartment.name ?? "",
        description: selectedDepartment.description ?? "",
        status: (selectedDepartment.status ?? 1) as 0 | 1,
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
    setSelectedDepartment(null);
    setOpenFormModal(true);
  };

  const handleOpenEditModal = (department: Department) => {
    setIsEdit(true);
    setSelectedDepartment(department);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setSelectedDepartment(null);
  };

  const handleOpenDeleteModal = (department: Department) => {
    setSelectedDepartment(department);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedDepartment(null);
  };

  const handleOpenViewModal = (department: Department) => {
    setSelectedDepartment(department);
    setOpenViewModal(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedDepartment(null);
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    try {
      await dispatch(deleteDepartment(selectedDepartment._id)).unwrap();
      toast.success("Department deleted successfully!");

      const isLastRowOnPage = departments.length === 1 && page > 0;
      const nextPage = isLastRowOnPage ? page - 1 : page;
      if (isLastRowOnPage) setPage(nextPage);
      await fetchDepartmentsData({ page: nextPage });
      handleCloseDeleteModal();
    } catch {
      toast.error("Failed to delete department");
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

  const statusText = (s?: number) => {
    const v = s ?? 1;
    return v === 0 ? "Inactive" : v === 1 ? "Active" : "-";
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1f2937", mb: 1 }}>
            Department Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Manage and track all your departments
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
          Add Department
        </Button>
      </Box>

      <Paper elevation={0} sx={{ mb: 2, p: 2, border: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
            placeholder="Search departments by name..."
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

        {!isLoading && !error && departments.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
              No departments found
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
              {searchTerm ? "Try adjusting your search terms" : "Click 'Add Department' to create your first department"}
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
                Add Department
              </Button>
            )}
          </Box>
        )}

        {!isLoading && !error && departments.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>S.No</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Department Name</TableCell>
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
                  {departments.map((dept: Department, index: number) => (
                    <TableRow
                      key={dept._id}
                      sx={{
                        "&:hover": { bgcolor: alpha("#3b82f6", 0.05) },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                            {dept.name}
                          </Typography>
                          {dept.description && (
                            <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mt: 0.5 }}>
                              {dept.description.length > 50 ? `${dept.description.substring(0, 50)}...` : dept.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>{dept.addedBy?.name || "-"}</TableCell>

                      <TableCell sx={{ color: "#6b7280" }}>{statusText(dept.status)}</TableCell>

                      <TableCell sx={{ color: "#6b7280" }}>{formatDate(dept.createdAt)}</TableCell>
                      <TableCell sx={{ color: "#6b7280" }}>{formatDate(dept.updatedAt)}</TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Tooltip title="View Department">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenViewModal(dept)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Department">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(dept)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Department">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteModal(dept)}
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

      <DepartmentFormModal
        isOpen={openFormModal}
        isEdit={isEdit}
        initialValues={getDepartmentInitialValues()}
        isLoading={isLoading}
        onClose={handleCloseFormModal}
        onSubmit={async (values: DepartmentFormData) => {
          try {
            if (isEdit && selectedDepartment) {
              await dispatch(updateDepartment({ id: selectedDepartment._id, data: values })).unwrap();
              toast.success("Department updated successfully!");
              await fetchDepartmentsData();
            } else {
              await dispatch(createDepartment(values)).unwrap();
              toast.success("Department created successfully!");
              setPage(0);
              setSelectedDepartment(null)
                
              await fetchDepartmentsData({ page: 0 });
            }
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
