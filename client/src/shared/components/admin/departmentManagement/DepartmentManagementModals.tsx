 import { useFormik } from "formik";
import { departmentValidationSchema } from "../../../../utils/validations/DepartmentValidations";
import type {
  Department,
  DepartmentFormData,
} from "../../../../utils/interfaces/departmentInterface";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  alpha,
} from "@mui/material";

 
type DepartmentFormModalProps = {
  isOpen: boolean;
  isEdit: boolean;
  initialValues: DepartmentFormData;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: DepartmentFormData) => Promise<void> | void;
};

export const DepartmentFormModal = ({
  isOpen,
  isEdit,
  initialValues,
  isLoading,
  onClose,
  onSubmit,
}: DepartmentFormModalProps) => {
  const formik = useFormik<DepartmentFormData>({
    initialValues,
    validationSchema: departmentValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting,resetForm }) => {
      try {
        resetForm();
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? "Edit Department" : "Add New Department"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          <TextField
            label="Department Name"
            fullWidth
            required
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && (formik.errors.name as string)}
            placeholder="Enter department name"
          />

          <TextField
            label="Status"
            select
            fullWidth
            required
            id="status"
            name="status"
            value={formik.values.status}
            onChange={(e) => formik.setFieldValue("status", Number(e.target.value))}
            onBlur={formik.handleBlur}
            error={formik.touched.status && Boolean(formik.errors.status)}
            helperText={
              formik.touched.status && formik.errors.status
                ? String(formik.errors.status)
                : "Select department status"
            }
          >
            <MenuItem value={0}>Inactive</MenuItem>
            <MenuItem value={1}>Active</MenuItem>
          </TextField>

          <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              id="description"
              name="description"
              value={formik.values.description ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={
                formik.touched.description && (formik.errors.description as string)
              }
              placeholder="Enter department description"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid #e5e7eb", px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
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
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={isLoading || formik.isSubmitting}
          sx={{
            textTransform: "none",
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {isLoading || formik.isSubmitting ? (
            <CircularProgress size={20} />
          ) : isEdit ? (
            "Update Department"
          ) : (
            "Create Department"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* =========================
   Department Delete Modal
   ========================= */
type DepartmentDeleteModalProps = {
  isOpen: boolean;
  departmentName: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export const DepartmentDeleteModal = ({
  isOpen,
  departmentName,
  isLoading,
  onCancel,
  onConfirm,
}: DepartmentDeleteModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ef4444" }}>
          Delete Department
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
          Are you sure you want to delete this department?
        </Typography>

        {!!departmentName && (
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
              {departmentName}
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
          onClick={onCancel}
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
          onClick={onConfirm}
          variant="contained"
          disabled={isLoading}
          sx={{
            textTransform: "none",
            bgcolor: "#ef4444",
            "&:hover": { bgcolor: "#dc2626" },
            "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {isLoading ? <CircularProgress size={20} /> : "Delete Department"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* =========================
   Department View Modal
   ========================= */
type DepartmentViewModalProps = {
  isOpen: boolean;
  department: Department | null;
  onClose: () => void;
};

export const DepartmentViewModal = ({
  isOpen,
  department,
  onClose,
}: DepartmentViewModalProps) => {
  const formatDate = (dateString?: string): string =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const statusLabel = (s?: number) => {
    const v = s ?? 1;
    return v === 0 ? "Inactive" : v === 1 ? "Active" : "-";
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          View Department
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Department Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#1f2937" }}>
              {department?.name || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Status
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>
              {statusLabel(department?.status)}
            </Typography>
          </Box>

          <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Description
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#374151", whiteSpace: "pre-wrap" }}
            >
              {department?.description || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Added By
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>
              {department?.addedBy?.name || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Created
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>
              {formatDate(department?.createdAt)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Updated
            </Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>
              {formatDate(department?.updatedAt)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid #e5e7eb", px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: "none",
            bgcolor: "#3b82f6",
            "&:hover": { bgcolor: "#2563eb" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
