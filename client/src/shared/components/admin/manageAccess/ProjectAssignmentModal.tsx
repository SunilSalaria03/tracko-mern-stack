import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles"; // <-- important: from styles
import { Close as CloseIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchProjectsWithoutParams, assignProjects } from "../../../../store/actions/projectActions";
import type { Employee } from "../../../../utils/interfaces/employeeInterface";
import type { ProjectAssignment } from "../../../../utils/interfaces/projectInterface";

interface ProjectAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee | null;
}

type StatusPalette = "error" | "success" | "info" | "warning" | "grey";

export const ProjectAssignmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
}: ProjectAssignmentModalProps) => {
  const dispatch = useAppDispatch();
  const { projects, isLoading: projectsLoading } = useAppSelector((state) => state.project);
  const [selectedProjects, setSelectedProjects] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProjectsWithoutParams());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (employee && projects.length > 0) {
      const initialSelection: Record<string, boolean> = {};
      projects.forEach((project) => {
        const isAssigned = employee.projectIds?.includes(project._id) || false;
        initialSelection[project._id] = isAssigned;
      });
      setSelectedProjects(initialSelection);
    } else if (!employee) {
      setSelectedProjects({});
    }
  }, [employee, projects]);

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleSubmit = async () => {
    if (!employee) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const projectAssignments: ProjectAssignment[] = Object.entries(selectedProjects).map(
        ([projectId, isSelected]) => ({
          projectId,
          allowAccess: isSelected,
        })
      );

      await dispatch(
        assignProjects({
          userId: employee._id,
          projects: projectAssignments,
        })
      ).unwrap();

      onSuccess();
    } catch (err: any) {
      setError(err || "Failed to update project assignments");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return a palette key name and a label, not a color string
  const getProjectStatus = (status?: 0 | 1 | 2 | 3): { label: string; palette: StatusPalette } => {
    switch (status) {
      case 0:
        return { label: "Inactive", palette: "error" };
      case 1:
        return { label: "Active", palette: "success" };
      case 2:
        return { label: "Completed", palette: "info" };
      case 3:
        return { label: "Cancelled", palette: "warning" };
      default:
        return { label: "Unknown", palette: "grey" };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: "600px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          background: (theme) => alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            Assign Projects
          </Typography>
          {employee && (
            <Typography variant="body2" color="text.secondary">
              Employee: {employee.name} ({employee.email})
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {projectsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Alert severity="info">No projects available to assign</Alert>
        ) : (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Select projects to assign:
            </Typography>
            <List sx={{ maxHeight: "400px", overflow: "auto" }}>
              {projects.map((project) => {
                const status = getProjectStatus(project.status);
                return (
                  <Paper
                    key={project._id}
                    elevation={1}
                    sx={{
                      mb: 1,
                      border: 1,
                      borderColor: selectedProjects[project._id] ? "primary.main" : "divider",
                      backgroundColor: (theme) =>
                        selectedProjects[project._id]
                          ? alpha(theme.palette.primary.main, 0.05)
                          : "transparent",
                    }}
                  >
                    <ListItem sx={{ alignItems: "flex-start", py: 1.5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!selectedProjects[project._id]}
                            onChange={() => handleToggleProject(project._id)}
                          />
                        }
                        label=""
                        sx={{ mr: 1, mt: 0.25 }}
                      />
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {project.name}
                            </Typography>
                            <Box
                              sx={(theme) => {
                                const color =
                                  status.palette === "grey"
                                    ? theme.palette.grey[500]
                                    : theme.palette[status.palette].main;
                                return {
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: alpha(color, 0.1),
                                };
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={(theme) => ({
                                  fontWeight: 500,
                                  color:
                                    status.palette === "grey"
                                      ? theme.palette.grey[700]
                                      : theme.palette[status.palette].main,
                                })}
                              >
                                {status.label}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {project.description || "No description"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(project.startDate)} - {formatDate(project.endDate)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || projectsLoading || projects.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {isSubmitting ? "Saving..." : "Save Assignments"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
