import { useState, type ChangeEvent,  } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem,
  alpha,
  InputAdornment,
  IconButton,
} from "@mui/material";
import type { FormikProps } from "formik";
import type { User, UserRole } from "../../../../utils/interfaces/userInterface";
import { getRoleName } from "../../../../utils/interfaces/userInterface";

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "QA",
  "Human Resources",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
];

const DESIGNATIONS = [
  "Intern",
  "Junior Developer",
  "Software Engineer",
  "Senior Software Engineer",
  "Tech Lead",
  "Project Manager",
  "Product Manager",
  "Designer",
  "QA Engineer",
];

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  formik: FormikProps<any>;
  combinedPhoneValue: string;
  handleCombinedPhoneChange: (e: ChangeEvent<HTMLInputElement>) => void;
  editingId: string | null;
};

export const UserFormDialog = ({
  open,
  onClose,
  formik,
  combinedPhoneValue,
  handleCombinedPhoneChange,
  editingId,
}: UserFormDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
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
          {editingId ? "Edit User" : "Add New User"}
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
            name="name"
            label="Name"
            fullWidth
            value={formik.values.name || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && (formik.errors as any).name}
            placeholder="Enter name"
          />

          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            required
            value={formik.values.email || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && (formik.errors as any).email}
            placeholder="Enter email"
          />

          <TextField
            select
            name="designation"
            label="Designation"
            fullWidth
            value={formik.values.designation || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.designation && Boolean((formik.errors as any).designation)
            }
            helperText={
              formik.touched.designation && (formik.errors as any).designation
                ? String((formik.errors as any).designation)
                : "Select designation"
            }
          >
            {DESIGNATIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name="department"
            label="Department"
            fullWidth
            value={formik.values.department || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.department && Boolean((formik.errors as any).department)
            }
            helperText={
              formik.touched.department && (formik.errors as any).department
                ? String((formik.errors as any).department)
                : "Select department"
            }
          >
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>

          {!editingId ? (
            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={formik.values.password || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && (formik.errors as any).password}
              placeholder="Enter password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <span className="material-icons" style={{ fontSize: 18 }}>visibility_off</span>
                      ) : (
                        <span className="material-icons" style={{ fontSize: 18 }}>visibility</span>
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <TextField
              name="password"
              label="Password (leave blank to keep unchanged)"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={formik.values.password || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && (formik.errors as any).password}
              placeholder="Optional"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <span className="material-icons" style={{ fontSize: 18 }}>visibility_off</span>
                      ) : (
                        <span className="material-icons" style={{ fontSize: 18 }}>visibility</span>
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          <TextField
            select
            name="role"
            label="Role"
            fullWidth
            value={formik.values.role ?? 3}
            onChange={(e) => formik.setFieldValue("role", Number(e.target.value) as UserRole)}
            onBlur={formik.handleBlur}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={
              formik.touched.role && formik.errors.role
                ? String(formik.errors.role)
                : "Select user role"
            }
          >
            {[0, 1, 2, 3].map((r) => (
              <MenuItem key={r} value={r}>
                {getRoleName(r as UserRole)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name="status"
            label="Status"
            fullWidth
            value={formik.values.status ?? 1}
            onChange={(e) => formik.setFieldValue("status", Number(e.target.value) as 0 | 1)}
            onBlur={formik.handleBlur}
            error={formik.touched.status && Boolean(formik.errors.status)}
            helperText={
              formik.touched.status && formik.errors.status
                ? String(formik.errors.status)
                : "Active = 1, Inactive = 0"
            }
          >
            <MenuItem value={1}>Active (1)</MenuItem>
            <MenuItem value={0}>Inactive (0)</MenuItem>
          </TextField>

          <TextField
            label="Phone (with country code)"
            fullWidth
            value={combinedPhoneValue}
            onChange={handleCombinedPhoneChange}
            placeholder="+91 9876543210"
            helperText={
              (formik.touched.countryCode && (formik.errors as any).countryCode
                ? `Country code: ${(formik.errors as any).countryCode}`
                : "") ||
              (formik.touched.phoneNumber && (formik.errors as any).phoneNumber
                ? `Phone: ${(formik.errors as any).phoneNumber as string}`
                : "Start with +country code, then number")
            }
            error={
              Boolean(formik.touched.countryCode && (formik.errors as any).countryCode) ||
              Boolean(formik.touched.phoneNumber && (formik.errors as any).phoneNumber)
            }
          />

          <TextField
            name="profileImage"
            label="Profile Image URL"
            fullWidth
            value={formik.values.profileImage || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.profileImage && Boolean((formik.errors as any).profileImage)}
            helperText={
              formik.touched.profileImage && (formik.errors as any).profileImage
                ? String((formik.errors as any).profileImage)
                : "Must be a valid URL"
            }
            placeholder="https://example.com/image.jpg"
          />

          <TextField
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            fullWidth
            value={formik.values.dateOfBirth || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
            helperText={
              formik.touched.dateOfBirth && formik.errors.dateOfBirth
                ? String(formik.errors.dateOfBirth)
                : "Format: YYYY-MM-DD"
            }
            InputLabelProps={{ shrink: true }}
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
          disabled={formik.isSubmitting}
          sx={{
            textTransform: "none",
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {formik.isSubmitting ? (
            <CircularProgress size={20} />
          ) : editingId ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type UserViewDialogProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  formatDate: (d?: string) => string;
};

export const UserViewDialog = ({ open, onClose, user, formatDate }: UserViewDialogProps) => {
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
          View User
        </Typography>
      </DialogTitle>
      <DialogContent>
        {user ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, py: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Name</Typography>
              <Typography variant="body1">{user.name || "-"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Email</Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Role</Typography>
              <Typography variant="body1">{getRoleName((user.role ?? 3) as UserRole)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Status</Typography>
              <Typography variant="body1">{user.status === 1 ? "Active" : "Inactive"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Phone</Typography>
              <Typography variant="body1">{`${user.countryCode ? user.countryCode + " " : ""}${user.phoneNumber || "-"}`}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>DOB</Typography>
              <Typography variant="body1">{user.dateOfBirth ? formatDate(user.dateOfBirth) : "-"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Designation</Typography>
              <Typography variant="body1">{user.designation || "-"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Department</Typography>
              <Typography variant="body1">{(user as any).department || "-"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Created</Typography>
              <Typography variant="body1">{formatDate(user.createdAt)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Updated</Typography>
              <Typography variant="body1">{formatDate(user.updatedAt)}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>Profile Image URL</Typography>
              <Typography variant="body1" sx={{ wordBreak: "break-all" }}>{user.profileImage || "-"}</Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "#6b7280" }}>No user selected.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};


