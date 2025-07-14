import React from 'react';
import type { LogoutModelProps } from '../common/interfaces';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const LogoutModel: React.FC<LogoutModelProps> = ({ isOpen, onClose, onLogout }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle align="center">Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText align="center">
          Are you sure you want to logout? You will need to login again to access your account.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button onClick={onLogout} variant="contained" color="error">
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModel; 