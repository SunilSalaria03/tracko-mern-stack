import { useState, useEffect, useCallback } from "react";
import {
  Box,
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
  Chip,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchEmployees } from "../../../../store/actions/employeeActions";
import { getRoleName } from "../../../../utils/interfaces/userInterface";
import { toast } from "react-toastify";
import { ProjectAssignmentModal } from "./ProjectAssignmentModal";
import type { Employee } from "../../../../utils/interfaces/employeeInterface";

const ProjectAssignment = () => {
  const dispatch = useAppDispatch();
  const { employees, total, isLoading, error } = useAppSelector(
    (state) => state.employee
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openAssignmentModal, setOpenAssignmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEmployeesData = useCallback(
    async (opts?: { page?: number; limit?: number; search?: string }) => {
      const effectivePage = (opts?.page ?? page) + 1;
      const effectiveLimit = opts?.limit ?? rowsPerPage;
      const effectiveSearch = opts?.search ?? debouncedSearch;

      try {
        await dispatch(
          fetchEmployees({
            page: effectivePage,
            limit: effectiveLimit,
            search: effectiveSearch,
            sortBy: "createdAt",
            sortOrder: "desc",
          })
        ).unwrap();
      } catch {
        toast.error("Failed to fetch employees");
      }
    },
    [dispatch, page, rowsPerPage, debouncedSearch]
  );

  useEffect(() => {
    fetchEmployeesData();
  }, [page, rowsPerPage, debouncedSearch]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

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

  const handleOpenAssignmentModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenAssignmentModal(true);
  };

  const handleCloseAssignmentModal = () => {
    setOpenAssignmentModal(false);
    setSelectedEmployee(null);
  };

  const handleAssignmentSuccess = () => {
    handleCloseAssignmentModal();
    fetchEmployeesData();
    toast.success("Project assignment updated successfully");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPage(0);
  };

  const getStatusColor = (status?: number) => {
    switch (status) {
      case 1:
        return "success";
      case 0:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status?: number) => {
    switch (status) {
      case 1:
        return "Active";
      case 0:
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            background: (theme) => alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Project Assignments
          </Typography>
        </Box>

        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow
                sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.1) }}
              >
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary">
                      {searchTerm
                        ? "No employees found matching your search"
                        : "No employees found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow
                    key={employee._id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {employee.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleName(employee.role)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {employee.department || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(employee.status)}
                        size="small"
                        color={getStatusColor(employee.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Assign Projects">
                        <IconButton
                          onClick={() => handleOpenAssignmentModal(employee)}
                          color="primary"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
        />
      </Paper>

      {openAssignmentModal && (
        <ProjectAssignmentModal
          isOpen={openAssignmentModal}
          onClose={handleCloseAssignmentModal}
          onSuccess={handleAssignmentSuccess}
          employee={selectedEmployee}
        />
      )}
    </Box>
  );
};

export default ProjectAssignment;
