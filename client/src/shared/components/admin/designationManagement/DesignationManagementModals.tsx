import { useFormik } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  alpha,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type {
  Designation,
  DesignationFormData,
} from "../../../../utils/interfaces/designationInterface";
import type { Department } from "../../../../utils/interfaces/departmentInterface";
import { useMemo } from "react";
import { designationValidationSchema } from "../../../../utils/validations/designationValidation";

type FormProps = {
  open: boolean;
  isEdit: boolean;
  initialValues: DesignationFormData;
  isSubmitting?: boolean;
  departments: Department[];
  onClose: () => void;
  onSubmit: (values: DesignationFormData) => Promise<void> | void;
};

export function DesignationFormModal({
  open,
  isEdit,
  initialValues,
  isSubmitting,
  departments,
  onClose,
  onSubmit,
}: FormProps) {
  const normalizedInitial = useMemo<DesignationFormData>(() => {
    return {
      departmentId:
        typeof initialValues?.departmentId === "object" &&
        initialValues?.departmentId !== null
          ? (initialValues.departmentId as { _id: string })._id
          : typeof initialValues?.departmentId === "string"
            ? initialValues.departmentId
            : "",
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    };
  }, [initialValues]);
  const formik = useFormik<DesignationFormData>({
    initialValues: normalizedInitial,
    enableReinitialize: true,
    validationSchema: designationValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (vals, helpers) => {
      try {
        await onSubmit(vals);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
 
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? "Edit Designation" : "Add New Designation"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <FormControl
              fullWidth
              required
              disabled={formik.isSubmitting || isSubmitting}
              error={
                formik.touched.departmentId &&
                Boolean(formik.errors.departmentId)
              }
              sx={{ flex: 1 }}
            >
              <InputLabel sx={{ fontSize: "16px" }}>Department</InputLabel>
              <Select
                name="departmentId"
                value={formik.values.departmentId}
                onChange={(event) =>
                  formik.setFieldValue("departmentId", event.target.value)
                }
                onBlur={formik.handleBlur}
                label="Department"
                sx={{
                  "& .MuiSelect-select": {
                    backgroundColor: formik.values.departmentId
                      ? "action.selected"
                      : "transparent",
                    fontSize: "16px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        "&:hover": {
                          backgroundColor: "action.hover",
                          color: "text.primary",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "primary.main",
                          color: "primary.contrastText",
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {departments.map((dept) => {
                  return (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  );
                })}
              </Select>
              {formik.touched.departmentId && formik.errors.departmentId && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.5, fontSize: "14px" }}
                >
                  {formik.errors.departmentId as string}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Designation Name"
              name="name"
              id="name"
              fullWidth
              required
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && (formik.errors.name as string)}
              placeholder="Enter designation name"
              sx={{ flex: 1 }}
            />
          </Box>
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
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={
              formik.touched.description &&
              (formik.errors.description as string)
            }
            placeholder="Enter designation description"
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ borderTop: "1px solid #e5e7eb", px: 3, py: 2, gap: 1 }}
      >
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
          disabled={formik.isSubmitting || isSubmitting}
          sx={{
            textTransform: "none",
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {formik.isSubmitting || isSubmitting ? (
            <CircularProgress size={20} />
          ) : isEdit ? (
            "Update Designation"
          ) : (
            "Create Designation"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- View Modal ---------- */
type ViewProps = {
  open: boolean;
  designation: Designation | null;
  departments: Department[];
  onClose: () => void;
};

export function DesignationViewModal({
  open,
  designation,
  departments,
  onClose,
}: ViewProps) {
  const Row = ({ label, value }: { label: string; value?: string }) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 2,
        py: 1,
        borderBottom: "1px solid #eee",
      }}
    >
      <Typography sx={{ color: "#6b7280", fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ color: "#111827" }}>{value || "-"}</Typography>
    </Box>
  );

  const formatDateTime = (d?: string) =>
    d ? new Date(d).toLocaleString() : "-";
  const deptName = (id?: string) =>
    (departments || []).find((d) => d._id === id)?.name || "-";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Designation Details
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ background: alpha("#3b82f6", 0.02) }}>
        {designation ? (
          <Box>
            <Row label="Designation" value={designation.name} />
            <Row
              label="Department"
              value={deptName(designation.departmentId)}
            />
            <Row label="Description" value={designation.description} />
            <Row
              label="Created"
              value={formatDateTime(designation.createdAt)}
            />
            <Row
              label="Updated"
              value={formatDateTime(designation.updatedAt)}
            />
          </Box>
        ) : (
          <Typography>No data</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ textTransform: "none" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- Delete Modal ---------- */
type DeleteProps = {
  open: boolean;
  itemName?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function DesignationDeleteModal({
  open,
  itemName,
  isLoading,
  onCancel,
  onConfirm,
}: DeleteProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ef4444" }}>
          Delete Designation
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
          Are you sure you want to delete this designation?
        </Typography>

        {itemName && (
          <Box
            sx={{
              p: 2,
              bgcolor: alpha("#ef4444", 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha("#ef4444", 0.2)}`,
            }}
          >
            <Typography variant="body2" sx={{ color: "#1f2937" }}>
              {itemName}
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
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isLoading}
          sx={{ textTransform: "none" }}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
