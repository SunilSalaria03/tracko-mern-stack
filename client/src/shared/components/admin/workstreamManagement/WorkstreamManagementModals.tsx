import { useFormik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  MenuItem,
  alpha,
  CircularProgress,
  Typography,
} from "@mui/material";
import type { Workstream, WorkstreamFormData } from "../../../../utils/interfaces/workstreamInterface";

/* ---------- Validation (numeric status: 0|1) ---------- */
const workstreamValidationSchema = Yup.object({
  name: Yup.string().trim().required("Workstream name is required").max(100, "Name is too long"),
  description: Yup.string().max(500, "Description is too long").required("Description is required"),
  status: Yup.mixed<0 | 1>().oneOf([0, 1], "Invalid status").required("Status is required"),
});

 type WorkstreamFormModalProps = {
  open: boolean;
  isEdit: boolean;
  initialValues: WorkstreamFormData;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: WorkstreamFormData) => Promise<void> | void;
  showStatusSelect?: boolean;
};

export function WorkstreamFormModal({
  open,
  isEdit,
  initialValues,
  isSubmitting,
  onClose,
  onSubmit,
  showStatusSelect = true,
}: WorkstreamFormModalProps) {
  const formik = useFormik<WorkstreamFormData>({
    initialValues,
    enableReinitialize: true,
    validationSchema: workstreamValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (vals, { setSubmitting ,resetForm}: FormikHelpers<WorkstreamFormData>) => {
      await onSubmit(vals);
      setSubmitting(false);
      resetForm();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? "Edit Workstream" : "Add New Workstream"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}
        >
          <TextField
            label="Workstream Name"
            name="name"
            id="name"
            fullWidth
            required
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && (formik.errors.name as string)}
            placeholder="Enter workstream name"
          />

          {showStatusSelect && (
            <TextField
              select
              label="Status"
              name="status"
              id="status"
              fullWidth
              value={formik.values.status}
              onChange={(e) => formik.setFieldValue("status", Number(e.target.value))}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && (formik.errors.status as string)}
            >
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Inactive</MenuItem>
            </TextField>
          )}

          <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
            <TextField
              label="Description"
              name="description"
              id="description"
              fullWidth
              multiline
              rows={3}
              value={formik.values.description || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && (formik.errors.description as string)}
              placeholder="Enter workstream description"
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
            "&:hover": { borderColor: "#9ca3af", bgcolor: alpha("#6b7280", 0.05) },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={formik.isSubmitting || isSubmitting}
          sx={{
            textTransform: "none",
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {formik.isSubmitting || isSubmitting ? <CircularProgress size={20} /> : isEdit ? "Update Workstream" : "Create Workstream"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

 type WorkstreamViewModalProps = {
  open: boolean;
  workstream: Workstream | null;
  onClose: () => void;
};

export function WorkstreamViewModal({ open, workstream, onClose }: WorkstreamViewModalProps) {
  const Row = ({ label, value }: { label: string; value?: string }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 2, py: 1, borderBottom: "1px solid #eee" }}>
      <Typography sx={{ color: "#6b7280", fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ color: "#111827" }}>{value || "-"}</Typography>
    </Box>
  );

  const formatDateTime = (d?: string) => (d ? new Date(d).toLocaleString() : "-");
  const statusLabel = (s?: 0 | 1) => (s === 1 ? "Active" : s === 0 ? "Inactive" : "-");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Workstream Details
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ background: alpha("#3b82f6", 0.02) }}>
        {workstream ? (
          <Box>
            <Row label="Name" value={workstream.name} />
            <Row label="Status" value={statusLabel(workstream.status as 0 | 1)} />
            <Row label="Description" value={workstream.description} />
            <Row label="Created" value={formatDateTime(workstream.createdAt)} />
            <Row label="Updated" value={formatDateTime(workstream.updatedAt)} />
          </Box>
        ) : (
          <Typography>No data</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

 type WorkstreamDeleteModalProps = {
  open: boolean;
  workstreamName?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function WorkstreamDeleteModal({
  open,
  workstreamName,
  isLoading,
  onCancel,
  onConfirm,
}: WorkstreamDeleteModalProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ef4444" }}>
          Delete Workstream
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
          Are you sure you want to delete this workstream?
        </Typography>

        {workstreamName && (
          <Box
            sx={{
              p: 2,
              bgcolor: alpha("#ef4444", 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha("#ef4444", 0.2)}`,
            }}
          >
            <Typography variant="body2" sx={{ color: "#1f2937" }}>
              {workstreamName}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ color: "#ef4444", mt: 2, fontWeight: 500 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isLoading} sx={{ textTransform: "none" }}>
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
