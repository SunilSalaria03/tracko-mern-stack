import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  alpha,
} from "@mui/material";
import { Link as LinkIcon } from "@mui/icons-material";
import type { TimeTrackManagementModalProps } from "../../../utils/interfaces/TimeTrackInterface";
import { clamp, formatDate } from "../../../utils/common/helpers";


 

const TimeTrackManagementModal = ({
  open,
  selectedDate,
  projects,
  workstreams,
  formData,
  onClose,
  onFormChange,
  onSubmit,
  getDisplayId,
  isEditMode = false,
}: TimeTrackManagementModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      aria-labelledby="time-entry-title"
    >
      <DialogTitle id="time-entry-title" sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEditMode ? "Edit time entry" : "New time entry"} {selectedDate ? `for ${formatDate(selectedDate)}` : ""}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Project"
            value={formData.project}
            onChange={(e) => onFormChange("project", e.target.value)}
            fullWidth
            size="medium"
            disabled={!projects.length}
            helperText={!projects.length ? "No projects available" : ""}
          >
            {projects.length === 0 ? (
              <MenuItem value="" disabled>
                No projects available
              </MenuItem>
            ) : (
              projects.map((p: any) => {
                const id = String(getDisplayId(p));
                return (
                  <MenuItem key={id} value={id}>
                    {p.name} {p.code ? `(${p.code})` : ""}
                  </MenuItem>
                );
              })
            )}
          </TextField>

          <TextField
            select
            label="Work Stream"
            value={formData.task}
            onChange={(e) => onFormChange("task", e.target.value)}
            fullWidth
            size="medium"
            disabled={!workstreams.length}
            helperText={!workstreams.length ? "No workstreams available" : ""}
          >
            {workstreams.length === 0 ? (
              <MenuItem value="" disabled>
                No workstreams available
              </MenuItem>
            ) : (
              workstreams.map((w: any) => {
                const id = String(getDisplayId(w));
                return (
                  <MenuItem key={id} value={id}>
                    {w.name}
                  </MenuItem>
                );
              })
            )}
          </TextField>

          <TextField
            label="Notes (optional)"
            value={formData.notes}
            onChange={(e) => onFormChange("notes", e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="medium"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: "#6b7280", fontWeight: 600 }}>
              Time Duration
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="Hours"
                type="number"
                value={formData.hours}
                onChange={(e) =>
                  onFormChange("hours", clamp(parseInt(e.target.value) || 0, 0, 24))
                }
                inputProps={{ min: 0, max: 24 }}
                fullWidth
                size="medium"
              />
              <Typography variant="h6" sx={{ color: "#6b7280" }}>
                :
              </Typography>
              <TextField
                label="Minutes"
                type="number"
                value={formData.minutes}
                onChange={(e) =>
                  onFormChange("minutes", clamp(parseInt(e.target.value) || 0, 0, 59))
                }
                inputProps={{ min: 0, max: 59, step: 15 }}
                fullWidth
                size="medium"
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#9ca3af", mt: 1, display: "block" }}>
              Enter the total time spent on this task
            </Typography>
          </Box>

          <Button
            variant="text"
            startIcon={<LinkIcon />}
            sx={{
              textTransform: "none",
              color: "#3b82f6",
              justifyContent: "flex-start",
              mt: 1,
              "&:hover": { bgcolor: alpha("#3b82f6", 0.05) },
            }}
          >
            Pull in a calendar event
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderColor: "#e5e7eb",
            color: "#6b7280",
            "&:hover": { borderColor: "#9ca3af", bgcolor: alpha("#6b7280", 0.05) },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!formData.project || !formData.task || (formData.hours === 0 && formData.minutes === 0)}
          sx={{
            textTransform: "none",
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
            "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {isEditMode ? "Update Time Entry" : "Add Time Entry"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeTrackManagementModal;

