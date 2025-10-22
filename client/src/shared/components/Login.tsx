import React, { useEffect, useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { loginValidation, validateField } from '../../utils/validations/AuthValidations';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../store/actions/authActions';
import { selectAppState } from '../../store/selectors';
import type { AppDispatch } from '../../store';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    authLoading: isLoading,
    authError: error,
    isAuthenticated,
  } = useSelector(selectAppState);
  

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateField('email', email, loginValidation);
    const passwordErr = validateField('password', password, loginValidation);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (!emailErr && !passwordErr) {
      dispatch(loginUser({ email, password }));
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
          Log into Tracko
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={2}>
          Welcome! Please enter your details.
        </Typography>
        <Divider sx={{ mb: 5 }}></Divider>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              id="email"
              label="Email or username"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                const error = validateField('email', value, loginValidation);
                setEmailError(error);
              }}
              error={!!emailError}
              helperText={emailError}
              fullWidth
              variant="outlined"
            />
            <TextField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                const error = validateField('password', value, loginValidation);
                setPasswordError(error);
              }}
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
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link
                component={RouterLink}
                to="/forgotPassword"
                variant="body2"
                color="text.secondary"
                underline="hover"
              >
                Forgot Password?
              </Link>
            </Stack>
            {error && (
              <Typography color="error" variant="body2" align="center">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ py: 1.3, fontWeight: 600, fontSize: 16 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;