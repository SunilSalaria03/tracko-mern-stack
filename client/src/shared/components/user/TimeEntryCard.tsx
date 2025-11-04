import { Box, Typography, Chip, IconButton, alpha } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import type { TimeEntryCardProps } from "../../../utils/interfaces/TimeTrackInterface";



const formatHours = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const TimeEntryCard = ({
  entry,
  getProjectName,
  getWorkstreamName,
  onDelete,
  onEdit,
  showDate = false,
  compact = false,
}: TimeEntryCardProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: compact ? 2 : 3,
        border: "1px solid #e5e7eb",
        borderRadius: compact ? 1 : 2,
        bgcolor: "white",
        "&:hover": { boxShadow: compact ? 1 : 2, borderColor: "#3b82f6" },
        transition: "all 0.2s",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          {showDate && (
            <Chip
              label={formatDate(new Date(entry.date))}
              size="small"
              sx={{ bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6", fontWeight: 600 }}
            />
          )}
          <Typography
            variant={compact ? "body2" : "h6"}
            sx={{ color: "#3b82f6", fontWeight: 600 }}
          >
            {getProjectName(entry.project)}
          </Typography>
          <Typography variant={compact ? "body2" : "body1"} sx={{ color: "#6b7280" }}>
            •
          </Typography>
          <Typography
            variant={compact ? "body2" : "body1"}
            sx={{ color: "#1f2937", fontWeight: compact ? 400 : 500 }}
          >
            {getWorkstreamName(entry.task)}
          </Typography>
        </Box>
        {entry.notes && (
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", mt: 1, fontSize: compact ? "0.875rem" : undefined }}
          >
            {entry.notes}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          label={formatHours(entry.hours)}
          sx={{
            bgcolor: alpha("#10b981", 0.1),
            color: "#10b981",
            fontWeight: 700,
            fontSize: compact ? "0.875rem" : "1rem",
            height: compact ? 32 : 36,
            px: 1,
          }}
        />
        {onEdit && (
          <IconButton
            aria-label="Edit time entry"
            size={compact ? "small" : "medium"}
            onClick={() => onEdit(entry.id)}
            disabled={entry.finalSubmit}
            sx={{
              color: entry.finalSubmit ? "#d1d5db" : "#6b7280",
              "&:hover": entry.finalSubmit ? {} : { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) },
              cursor: entry.finalSubmit ? "not-allowed" : "pointer",
            }}
          >
            <EditIcon fontSize={compact ? "small" : undefined} />
          </IconButton>
        )}
        <IconButton
          aria-label="Delete time entry"
          size={compact ? "small" : "medium"}
          onClick={() => onDelete(entry.id)}
          disabled={entry.finalSubmit}
          sx={{
            color: entry.finalSubmit ? "#d1d5db" : "#6b7280",
            "&:hover": entry.finalSubmit ? {} : { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) },
            cursor: entry.finalSubmit ? "not-allowed" : "pointer",
          }}
        >
          <DeleteIcon fontSize={compact ? "small" : undefined} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TimeEntryCard;

