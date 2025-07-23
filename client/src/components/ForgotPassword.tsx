import React, { useState } from 'react';
import type { ForgotPasswordFormData } from '../utils/interfaces/authInterface';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack
} from '@mui/material';

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={6} sx={{ p: 5, width: '100%', borderRadius: 4 }}>
        <Typography variant="h5" align="center" fontWeight={600} mb={1}>
          Reset Your Password
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          Enter the email address for your Tracko account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleEmailChange}
              fullWidth
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ py: 1.3, fontWeight: 600, fontSize: 16 }}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="text"
              color="primary"
              fullWidth
              sx={{ mt: 2, fontWeight: 500, fontSize: 16 }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword; 