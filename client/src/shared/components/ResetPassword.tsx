import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { HiEye, HiEyeOff, HiOutlineArrowRight } from 'react-icons/hi';
import {
  resetPasswordValidation,
  validateField,
} from '../../utils/validations/AuthValidations';
import { resetPassword } from '../../store/actions/authActions';
import type { AppDispatch } from '../../store';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !token) {
      navigate('/login');
    }
  }, [email, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passError = validateField('password', password, resetPasswordValidation);
    const confirmPassError = validateField('confirmPassword', confirmPassword, resetPasswordValidation);

    setPasswordError(passError);
    setConfirmPasswordError(confirmPassError);

    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    if (!passError && !confirmPassError && email && token) {
      setIsLoading(true);
      try {
        await dispatch(
          resetPassword({
            encryptedEmail: email,
            resetPasswordToken: token,
            password,
          })
        ).unwrap();
        navigate('/login');
      } catch (err) {
        console.error('Reset password error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const error = validateField('password', value, resetPasswordValidation);
    setPasswordError(error);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (password && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={6} sx={{ p: 5, width: '100%', borderRadius: 4 }}>
        <Typography variant="h5" align="center" fontWeight={600} mb={1} color="primary">
          Set new password
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={4}>
          Your new password must be different from previous password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={handlePasswordChange}
              error={!!passwordError}
              helperText={passwordError}
              fullWidth
              variant="outlined"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <HiEyeOff /> : <HiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              fullWidth
              variant="outlined"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ py: 1.3, fontWeight: 600, fontSize: 16, mt: 2 }}
              endIcon={<HiOutlineArrowRight />}
            >
              {isLoading ? 'Resetting...' : 'Submit'}
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Back to{' '}
              <Link
                to="/login"
                style={{ fontWeight: 500, textDecoration: 'underline' }}
              >
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;

