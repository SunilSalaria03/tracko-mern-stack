import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { HiOutlineCamera, HiOutlineArrowLeft, HiOutlinePencil, HiOutlineX } from 'react-icons/hi';
import { selectAppState } from '../../../store/selectors';
import { updateUserProfile, fetchUserProfile } from '../../../store/actions/userActions';
import type { AppDispatch } from '../../../store';
 
const Profile: React.FC = () => {
  const { authUser: user } = useSelector(selectAppState);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    countryCode: user?.countryCode || '+1',
  });

  // Store original data when entering edit mode
  const [originalData, setOriginalData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    countryCode: user?.countryCode || '+1',
  });

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || '+1',
      };
      setFormData(userData);
      setOriginalData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || '+1',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const handleCameraClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Check for changed fields and image
      const changedFields: Partial<typeof formData> = {};
      
      if (formData.name !== originalData.name) {
        changedFields.name = formData.name;
      }
      if (formData.phoneNumber !== originalData.phoneNumber) {
        changedFields.phoneNumber = formData.phoneNumber;
      }
      if (formData.countryCode !== originalData.countryCode) {
        changedFields.countryCode = formData.countryCode;
      }

      // Check if there are any changes (including image)
      if (Object.keys(changedFields).length === 0 && !selectedImage) {
        setErrorMessage('No changes detected');
        setLoading(false);
        return;
      }

      // If there's an image, use FormData, otherwise use regular JSON
      if (selectedImage) {
        const formDataToSend = new FormData();
        
        // Add changed fields to FormData
        Object.entries(changedFields).forEach(([key, value]) => {
          formDataToSend.append(key, value as string);
        });
        
        // Add image
        formDataToSend.append('profileImage', selectedImage);

        // Call API with FormData
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }

        setSuccessMessage('Profile updated successfully!');
      } else {
        // No image, use regular update
        await dispatch(updateUserProfile(changedFields)).unwrap();
        setSuccessMessage('Profile updated successfully!');
      }

      // Fetch fresh profile data from API to update Redux and UI
      await dispatch(fetchUserProfile()).unwrap();

      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
      
      // Update original data with new values
      if (user) {
        setOriginalData({
          name: user.name || '',
          phoneNumber: user.phoneNumber || '',
          countryCode: user.countryCode || '+1',
        });
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || '+1',
      });
      setOriginalData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        countryCode: user.countryCode || '+1',
      });
    }
  };

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 0:
        return 'Super Admin';
      case 1:
        return 'Admin';
      case 2:
        return 'Manager';
      case 3:
        return 'Employee';     
      default:
        return 'Unknown';
    }
  };

  const getProfileImageUrl = () => {
    if (imagePreview) {
      return imagePreview;
    }
    
    if (user?.profileImage) {
      const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:5002';
      return `${IMAGE_BASE_URL}${user.profileImage}`;
    }
    
    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc]">
     
      
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, px: 3, width: '100%' }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
            Profile Settings
          </Typography>
        </Box>

         {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

         <Paper 
          elevation={0}
          sx={{ 
            border: '1px solid #e5e7eb',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
           <Box
            sx={{
              height: 120,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />

           <Box sx={{ px: 4, pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ mt: -6, position: 'relative' }}>
                 <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                
                 {profileImageUrl ? (
                  <Avatar
                    src={profileImageUrl}
                    alt={imagePreview ? 'Preview' : user?.name}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: '4px solid white',
                      boxShadow: 2
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120,
                      bgcolor: '#3b82f6',
                      border: '4px solid white',
                      boxShadow: 2,
                      fontSize: '2.5rem',
                      fontWeight: 600
                    }}
                  >
                    {getUserInitials(user?.name || 'User')}
                  </Avatar>
                )}
                <IconButton
                  onClick={handleCameraClick}
                  disabled={!isEditing}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'white',
                    border: '2px solid #e5e7eb',
                    '&:hover': { bgcolor: isEditing ? '#eff6ff' : '#f9fafb' },
                    width: 36,
                    height: 36,
                    cursor: isEditing ? 'pointer' : 'default',
                    opacity: isEditing ? 1 : 0.6
                  }}
                >
                  <HiOutlineCamera className="w-5 h-5 text-gray-600" />
                </IconButton>
              </Box>

              {!isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<HiOutlinePencil />}
                  onClick={() => setIsEditing(true)}
                  sx={{
                    mt: 2,
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      bgcolor: '#eff6ff'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                {user?.email}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 2,
                  py: 0.5,
                  bgcolor: '#eff6ff',
                  color: '#3b82f6',
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                {getRoleLabel(user?.role || 1)}
              </Box>
            </Box>
          </Box>

          <Divider />

           <Box sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
                    Full Name
                  </Typography>
                  <TextField
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    variant="outlined"
                    placeholder="Enter your full name"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isEditing ? 'white' : '#f9fafb',
                        '&:hover fieldset': {
                          borderColor: isEditing ? '#3b82f6' : '#e5e7eb',
                        },
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true}
                    variant="outlined"
                    placeholder="Enter your email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f9fafb',
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: '30%' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
                      Country Code
                    </Typography>
                    <TextField
                      fullWidth
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      disabled
                      variant="outlined"
                      placeholder="+1"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: isEditing ? 'white' : '#f9fafb',
                          '&:hover fieldset': {
                            borderColor: isEditing ? '#3b82f6' : '#e5e7eb',
                          },
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
                      Phone Number
                    </Typography>
                    <TextField
                      fullWidth
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled
                      variant="outlined"
                      placeholder="Enter your phone number"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: isEditing ? 'white' : '#f9fafb',
                          '&:hover fieldset': {
                            borderColor: isEditing ? '#3b82f6' : '#e5e7eb',
                          },
                        }
                      }}
                    />
                  </Box>
                </Box>

                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        bgcolor: '#3b82f6',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': { bgcolor: '#2563eb' },
                        '&:disabled': { bgcolor: '#93c5fd' }
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                      startIcon={<HiOutlineX />}
                      sx={{
                        borderColor: '#e5e7eb',
                        color: '#374151',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': {
                          borderColor: '#dc2626',
                          color: '#dc2626',
                          bgcolor: '#fef2f2'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default Profile;

