import { useFormik } from "formik";
import { projectValidationSchema } from "../../../../utils/validations/ProjectValidations";
import type { Project, ProjectFormData } from "../../../../utils/interfaces/projectInterface";
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

type ProjectFormModalProps = {
  isOpen: boolean;
  isEdit: boolean;
  initialValues: ProjectFormData;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormData) => Promise<void> | void;
};

export const ProjectFormModal = ({
  isOpen,
  isEdit,
  initialValues,
  isLoading,
  onClose,
  onSubmit,
}: ProjectFormModalProps) => {
  const formik = useFormik<ProjectFormData>({
    initialValues,
    validationSchema: projectValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? "Edit Project" : "Add New Project"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}
        >
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
            helperText={formik.touched.name && (formik.errors.name as string)}
            placeholder="Enter project name"
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
                : "Select project status"
            }
          >
            <MenuItem value={0}>Inactive</MenuItem>
            <MenuItem value={1}>Active</MenuItem>
            <MenuItem value={2}>Completed</MenuItem>
            <MenuItem value={3}>Cancelled</MenuItem>
          </TextField>

          <TextField
            label="Start Date"
            type="date"
            fullWidth
            required
            id="startDate"
            name="startDate"
            value={formik.values.startDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.startDate && Boolean(formik.errors.startDate)}
            helperText={
              formik.touched.startDate && formik.errors.startDate
                ? String(formik.errors.startDate)
                : "Format: YYYY-MM-DD"
            }
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="End Date"
            type="date"
            fullWidth
            required
            id="endDate"
            name="endDate"
            value={formik.values.endDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.endDate && Boolean(formik.errors.endDate)}
            helperText={
              formik.touched.endDate && formik.errors.endDate
                ? String(formik.errors.endDate)
                : "Format: YYYY-MM-DD"
            }
            InputLabelProps={{ shrink: true }}
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
            sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}
          />
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
            "&:hover": { borderColor: "#9ca3af", bgcolor: alpha("#6b7280", 0.05) },
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
          {isLoading || formik.isSubmitting ? <CircularProgress size={20} /> : isEdit ? "Update Project" : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type ProjectDeleteModalProps = {
  isOpen: boolean;
  projectName: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export const ProjectDeleteModal = ({ isOpen, projectName, isLoading, onCancel, onConfirm }: ProjectDeleteModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ef4444" }}>
          Delete Project
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
          Are you sure you want to delete this project?
        </Typography>
        {!!projectName && (
          <Box
            sx={{
              p: 2,
              bgcolor: alpha("#ef4444", 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha("#ef4444", 0.2)}`,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937", mb: 0.5 }}>
              {projectName}
            </Typography>
          </Box>
        )}
        <Typography variant="body2" sx={{ color: "#ef4444", mt: 2, fontWeight: 500 }}>
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
            "&:hover": { borderColor: "#9ca3af", bgcolor: alpha("#6b7280", 0.05) },
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
          {isLoading ? <CircularProgress size={20} /> : "Delete Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


type ProjectViewModalProps = {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
};

export const ProjectViewModal = ({ isOpen, project, onClose }: ProjectViewModalProps) => {
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
    return v === 0 ? "Inactive" : v === 1 ? "Active" : v === 2 ? "Completed" : v === 3 ? "Cancelled" : "-";
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          View Project
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>Project Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#1f2937" }}>{project?.name || "-"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>Status</Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>{statusLabel(project?.status)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>Start Date</Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>{formatDate(project?.startDate)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>End Date</Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>{formatDate(project?.endDate)}</Typography>
          </Box>
          <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>Description</Typography>
            <Typography variant="body1" sx={{ color: "#374151", whiteSpace: "pre-wrap" }}>
              {project?.description || "-"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>Added By</Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>{project?.addedBy?.name || "-"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>Created</Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>{formatDate(project?.createdAt)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>Updated</Typography>
            <Typography variant="body1" sx={{ color: "#374151" }}>{formatDate(project?.updatedAt)}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: "1px solid #e5e7eb", px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ textTransform: "none", bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};


