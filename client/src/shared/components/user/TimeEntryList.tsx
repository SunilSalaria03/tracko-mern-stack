import { Box, Paper, Typography } from "@mui/material";
import TimeEntryCard from "./TimeEntryCard";
import type { TimeEntryListProps } from "../../../utils/interfaces/TimeTrackInterface";



const TimeEntryList = ({
  entries,
  getProjectName,
  getWorkstreamName,
  onDelete,
  onEdit,
  title = "Time Entries",
  showDate = false,
}: TimeEntryListProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ mt: 3, border: "1px solid #e5e7eb" }}>
      <Box sx={{ p: 2, bgcolor: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937" }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {entries.map((entry) => (
            <TimeEntryCard
              key={entry.id}
              entry={entry}
              getProjectName={getProjectName}
              getWorkstreamName={getWorkstreamName}
              onDelete={onDelete}
              onEdit={onEdit}
              showDate={showDate}
              compact
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default TimeEntryList;

