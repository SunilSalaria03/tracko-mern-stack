// src/features/admins/components/AdminManagementModals.tsx
import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Typography,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import type {
  Admin,
  AdminFormData,
} from "../../../../utils/interfaces/adminInterface";
import { getAdminValidationSchema } from "../../../../utils/validations/adminValidation";
import { ROLE_NAMES, ROLES } from "../../../../utils/constants/roles";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchDepartments } from "../../../../store/actions/departmentActions";
import { fetchDesignations } from "../../../../store/actions/designationActions";

type AdminFormModalProps = {
  open: boolean;
  isEdit: boolean;
  initialValues: AdminFormData;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminFormData) => Promise<void> | void;
};

 
export function AdminFormModal({
  open,
  isEdit,
  initialValues,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();

  const { departments } = useAppSelector((state) => state.departmentManagement);
  const { designations } = useAppSelector(
    (state) => state.designationManagement
  );

  const deptState = useAppSelector((s: any) => s.departments ?? {});
  const desigState = useAppSelector((s: any) => s.designations ?? {});

 

  const depsLoading = Boolean(deptState.isLoading ?? deptState.loading);
  const desigsLoading = Boolean(desigState.isLoading ?? desigState.loading);

  const fetchOptions = async () => {
    try {
      await dispatch(fetchDepartments({}));
      await dispatch(fetchDesignations({}));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [dispatch]);

  const normalized = useMemo<AdminFormData>(
    () => ({
      role: (initialValues.role ?? 1) as 0 | 1 | 2,
      email: initialValues.email ?? "",
      name: initialValues.name ?? "",
      phoneNumber: initialValues.phoneNumber ?? "",
      countryCode: initialValues.countryCode ?? "+91",
      designation: initialValues.designation ?? "",
      department: initialValues.department ?? "",
       password: isEdit ? "" : (initialValues.password ?? ""),
      dateOfBirth: initialValues.dateOfBirth ?? "",
    }),
    [initialValues, isEdit]
  );

  const formik = useFormik<AdminFormData>({
    initialValues: normalized,
    enableReinitialize: true,
    validationSchema: getAdminValidationSchema(isEdit),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (vals, helpers) => {
      try {
        await onSubmit({
          ...vals,
          password: isEdit ? undefined : vals.password,
        });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  console.log("errors" , formik.errors)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #e5e7eb", pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? "Edit Admin" : "Add New Admin"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Name"
            name="name"
            fullWidth
            required
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && (formik.errors.name as string)}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            disabled={isEdit}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && (formik.errors.email as string)}
          />

          <TextField
            select
            label="Role"
            name="role"
            fullWidth
            required
            value={formik.values.role}
            onChange={(e) =>
              formik.setFieldValue("role", Number(e.target.value))
            }
            onBlur={formik.handleBlur}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && (formik.errors.role as string)}
          >
            <MenuItem value={ROLES.ADMIN}>{ROLE_NAMES[ROLES.ADMIN]}</MenuItem>
            <MenuItem value={ROLES.MANAGER}>
              {ROLE_NAMES[ROLES.MANAGER]}
            </MenuItem>
            <MenuItem value={ROLES.EMPLOYEE}>
              {ROLE_NAMES[ROLES.EMPLOYEE]}
            </MenuItem>
          </TextField>
 

          <TextField
            select
            label="Designation"
            name="designation"
            fullWidth
            required
            value={formik.values.designation ?? ""}
            onChange={(e) =>
              formik.setFieldValue("designation", e.target.value)
            }
            onBlur={formik.handleBlur}
            error={
              formik.touched.designation && Boolean(formik.errors.designation)
            }
            helperText={
              (formik.touched.designation &&
                (formik.errors.designation as string)) ||
              (desigsLoading ? "Loading designations..." : undefined)
            }
            disabled={desigsLoading}
          >
            {designations.length > 0 ? (
              designations?.map((d) => (
                <MenuItem key={d._id} value={String(d._id)}>
                  {d.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                {desigsLoading ? "Loading..." : "No designations found"}
              </MenuItem>
            )}
          </TextField>

          <TextField
            select
            label="Department"
            name="department"
            fullWidth
            required
            value={formik.values.department ?? ""}
            onChange={(e) => formik.setFieldValue("department", e.target.value)}
            onBlur={formik.handleBlur}
            error={
              formik.touched.department && Boolean(formik.errors.department)
            }
            helperText={
              (formik.touched.department &&
                (formik.errors.department as string)) ||
              (depsLoading ? "Loading departments..." : undefined)
            }
            disabled={depsLoading}
          >
            {departments.length > 0 ? (
              departments.map((d) => (
                <MenuItem key={d._id} value={String(d._id)}>
                  {d.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                {depsLoading ? "Loading..." : "No departments found"}
              </MenuItem>
            )}
          </TextField>

          <TextField
            label="Country Code"
            name="countryCode"
            fullWidth
            value={formik.values.countryCode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.countryCode && Boolean(formik.errors.countryCode)
            }
            helperText={
              formik.touched.countryCode &&
              (formik.errors.countryCode as string)
            }
          />

          <TextField
            label="Phone Number"
            name="phoneNumber"
            fullWidth
            required
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
            }
            helperText={
              formik.touched.phoneNumber &&
              (formik.errors.phoneNumber as string)
            }
          />

          <TextField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formik.values.dateOfBirth || ""}
            onChange={formik.handleChange}
          />

          {!isEdit && (
            <TextField
              label="Password"
              name="password"
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              value={formik.values.password || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={
                formik.touched.password && (formik.errors.password as string)
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
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
            "Update Admin"
          ) : (
            "Create Admin"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type AdminViewModalProps = {
  open: boolean;
  admin: Admin | null;
  onClose: () => void;
};

export function AdminViewModal({ open, admin, onClose }: AdminViewModalProps) {
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
          Admin Details
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ background: alpha("#3b82f6", 0.02) }}>
        {admin ? (
          <Box>
            <Row label="Name" value={admin.name} />
            <Row label="Email" value={admin.email} />
            {/* <Row label="Role" value={ROLE_NAMES[admin.role as ROLES]} /> */}
            <Row label="Designation" value={admin.designation} />
            <Row label="Department" value={admin.department} />
            <Row
              label="Phone"
              value={`${admin.countryCode} ${admin.phoneNumber}`}
            />
            <Row
              label="Status"
              value={admin.status === 1 ? "Active" : "Inactive"}
            />
            <Row
              label="DOB"
              value={
                admin.dateOfBirth
                  ? new Date(admin.dateOfBirth).toLocaleDateString()
                  : "-"
              }
            />
            <Row label="Created" value={formatDateTime(admin.createdAt)} />
            <Row label="Updated" value={formatDateTime(admin.updatedAt)} />
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

type AdminDeleteModalProps = {
  open: boolean;
  highlight?: string; // e.g., "Mukesh (mukesh@...)"
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
};

export function AdminDeleteModal({
  open,
  highlight,
  onCancel,
  onConfirm,
  isLoading,
}: AdminDeleteModalProps) {
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
          Delete Admin
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: "#6b7280", mb: 2 }}>
          Are you sure you want to delete this admin?
        </Typography>
        {highlight && (
          <Box
            sx={{
              p: 2,
              bgcolor: alpha("#ef4444", 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha("#ef4444", 0.2)}`,
            }}
          >
            <Typography variant="body2" sx={{ color: "#1f2937" }}>
              {highlight}
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
