import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { User, Shield, Eye, EyeOff, Save } from "lucide-react";
import Profile from "./Profile";
import { useAppDispatch, useAppSelector } from "../../../store";
import { changePassword } from "../../../store/actions/userActions";

function TabPanel(props: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountSetting: React.FC = () => {
  const tabs = useMemo(
    () =>
      [
        { key: "profile", label: "Profile", icon: <User size={20} /> },
        {
          key: "changePassword",
          label: "Security",
          icon: <Shield size={20} />,
        },
      ] as const,
    []
  );

  const [tabIndex, setTabIndex] = useState<number>(0);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector((s) => s.user.isLoading);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters");
      return;
    }

    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
      setSuccessMessage("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as string) || "Failed to change password";
      setErrorMessage(msg);
    }
  };

  return (
    <Box sx={{ p: {} }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mt: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="account settings tabs"
          >
            <Tab
              icon={tabs[0].icon}
              iconPosition="start"
              label={tabs[0].label}
              sx={{ textTransform: "none", fontWeight: 600 }}
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
            <Tab
              icon={tabs[1].icon}
              iconPosition="start"
              label={tabs[1].label}
              sx={{ textTransform: "none", fontWeight: 600 }}
              id="settings-tab-1"
              aria-controls="settings-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabIndex} index={0}>
          <Profile />
        </TabPanel>


        <TabPanel value={tabIndex} index={1}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
            }}
          >
            <form onSubmit={handleChangePassword}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => {
                    if (errorMessage) setErrorMessage("");
                    if (successMessage) setSuccessMessage("");
                    setOldPassword(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword((v) => !v)}
                          edge="end"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    if (errorMessage) setErrorMessage("");
                    if (successMessage) setSuccessMessage("");
                    setNewPassword(e.target.value);
                  }}
                  helperText="Use at least 8 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword((v) => !v)}
                          edge="end"
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    if (errorMessage) setErrorMessage("");
                    if (successMessage) setSuccessMessage("");
                    setConfirmPassword(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Save size={18} />
                      )
                    }
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AccountSetting;
