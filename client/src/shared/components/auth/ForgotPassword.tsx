import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { HiOutlineArrowRight } from 'react-icons/hi';
import {
  forgotPasswordValidation,
  validateField,
} from '../../../utils/validations/AuthValidations';
import { forgotPassword } from '../../../store/actions/authActions';
import type { AppDispatch } from '../../../store';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateField('email', email, forgotPasswordValidation);
    setEmailError(error);

    if (!error) {
      setIsLoading(true);
      try {
        await dispatch(forgotPassword({ email })).unwrap();
        setIsSuccess(true);
      } catch (err) {
        console.error('Forgot password error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const error = validateField('email', value, forgotPasswordValidation);
    setEmailError(error);
  };

  if (isSuccess) {
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
        <Paper elevation={6} sx={{ p: 5, width: '100%', borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600} mb={2} color="primary">
            Check Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and follow the instructions to reset your password.
          </Typography>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.3, fontWeight: 600, fontSize: 16 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

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
          Forgot Password
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={4}>
          Please enter your email to receive password reset link
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
              fullWidth
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ py: 1.3, fontWeight: 600, fontSize: 16 }}
              endIcon={<HiOutlineArrowRight />}
            >
              {isLoading ? 'Sending...' : 'Send Email Link'}
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

export default ForgotPassword;

