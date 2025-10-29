import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog } from 'react-icons/hi';
import { selectAppState } from '../../../store/selectors';
import { logoutUser } from '../../../store/actions/authActions';
import type { AppDispatch } from '../../../store';
import LogoutModel from '../../../models/logoutModel';

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { authUser: user } = useSelector(selectAppState);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:5002';
  const userProfileImage = user?.profileImage
    ? `${IMAGE_BASE_URL}${user.profileImage}`
    : '';
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLogoutModalOpen(false);
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLogoutModalOpen(false);
      navigate('/login');
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                padding: 0.5,
                '&:hover': { backgroundColor: 'transparent' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 600 }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {user?.role === 0 ? 'Admin' : user?.role === 1 ? 'Employee' : 'Moderator'}
                  </Typography>
                </Box>
                {user?.profileImage ? (
                  <Avatar
                    src={userProfileImage || ''}
                    alt={user?.name || 'User'}
                    sx={{ width: 40, height: 40, border: '2px solid #e5e7eb' }}
                  />
                ) : (
                  <Avatar
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: '#3b82f6',
                      border: '2px solid #e5e7eb',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {getUserInitials(user?.name || 'User')}
                  </Avatar>
                )}
              </Box>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    gap: 1.5,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {user?.email || ''}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <HiOutlineUser className="w-5 h-5 text-gray-600" />
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <HiOutlineCog className="w-5 h-5 text-gray-600" />
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick} sx={{ color: '#dc2626' }}>
                <HiOutlineLogout className="w-5 h-5" />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <LogoutModel
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onLogout={handleLogoutConfirm}
      />
    </>
  );
};

export default Navbar;

