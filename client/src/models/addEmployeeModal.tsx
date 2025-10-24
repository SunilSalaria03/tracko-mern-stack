import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import type { AddEmployeeModalProps, AddEmployeeFormData } from '../utils/interfaces/employeeInterface';
import { useAppDispatch } from '../store';
import { signUp } from '../store/actions/authActions';

const initialFormData: AddEmployeeFormData = {
  name: '',
  email: '',
  dateOfBirth: '',
  phoneNumber: '',
  countryCode: '+1',
  password: '',
  confirmPassword: '',
  role: 1, // Default to employee
};

interface FieldErrors {
  name?: string;
  email?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<AddEmployeeFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        break;
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        break;
      case 'phoneNumber':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\d{10,15}$/.test(value.trim())) return 'Phone number must be 10-15 digits';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (!value) return 'Confirm password is required';
        if (value !== formData.password) return 'Passwords do not match';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field on change if it was touched
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    Object.keys(initialFormData).forEach((key) => {
      if (key !== 'role' && key !== 'countryCode') {
        const error = validateField(key, formData[key as keyof AddEmployeeFormData] as string);
        if (error) {
          errors[key as keyof FieldErrors] = error;
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    setTouched({
      name: true,
      email: true,
      dateOfBirth: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const signUpData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber.trim(),
        countryCode: formData.countryCode,
        dateOfBirth: formData.dateOfBirth,
      };

      await dispatch(signUp(signUpData)).unwrap();
      
      setFormData(initialFormData);
      setFieldErrors({});
      setTouched({});
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setError(null);
      setFieldErrors({});
      setTouched({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add New Employee
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                placeholder="Enter full name"
                error={touched.name && !!fieldErrors.name}
                helperText={touched.name && fieldErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                placeholder="Enter email address"
                error={touched.email && !!fieldErrors.email}
                helperText={touched.email && fieldErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
                error={touched.dateOfBirth && !!fieldErrors.dateOfBirth}
                helperText={touched.dateOfBirth && fieldErrors.dateOfBirth}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                select
                value={formData.role}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <MenuItem value={1}>Employee</MenuItem>
                <MenuItem value={2}>Moderator</MenuItem>
                <MenuItem value={0}>Admin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country Code"
                name="countryCode"
                select
                value={formData.countryCode}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <MenuItem value="+1">+1 (USA/Canada)</MenuItem>
                <MenuItem value="+44">+44 (UK)</MenuItem>
                <MenuItem value="+91">+91 (India)</MenuItem>
                <MenuItem value="+61">+61 (Australia)</MenuItem>
                <MenuItem value="+81">+81 (Japan)</MenuItem>
                <MenuItem value="+86">+86 (China)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                placeholder="Enter phone number (digits only)"
                error={touched.phoneNumber && !!fieldErrors.phoneNumber}
                helperText={touched.phoneNumber && fieldErrors.phoneNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                placeholder="Enter password (min 6 characters)"
                error={touched.password && !!fieldErrors.password}
                helperText={touched.password && fieldErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                placeholder="Confirm password"
                error={touched.confirmPassword && !!fieldErrors.confirmPassword}
                helperText={touched.confirmPassword && fieldErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Adding...' : 'Add Employee'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEmployeeModal;
