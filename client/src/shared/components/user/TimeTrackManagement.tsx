import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useAppSelector } from "../../../store";
import { useDispatch } from "react-redux";
import { fetchProjects } from "../../../store/actions/projectActions";
import { fetchWorkstreams } from "../../../store/actions/workstreamActions";

type ViewMode = "day" | "week";

interface TimeEntry {
  id: string;
  date: Date;
  // store IDs
  project: string;
  task: string; // workstream id
  notes: string;
  hours: number; // decimal hours (e.g., 1.5)
}

// Helpers
const getId = (o: any) => o?.id ?? o?._id; // supports either shape
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const toHours = (hours: number, minutes: number) => {
  const h = Math.max(0, hours | 0);
  const m = clamp(minutes | 0, 0, 59);
  return h + m / 60;
};
const toDateKey = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
const formatHours = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

const TimeTrackManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const dispatch = useDispatch();
  const { projects } = useAppSelector((s) => s.project);
  const { workstreams } = useAppSelector((s) => s.workstream);

  // Build lookup maps (robust to id/_id)
  const projectMap = useMemo(
    () => new Map<string, any>(projects?.map((p: any) => [String(getId(p)), p]) ?? []),
    [projects]
  );
  const workstreamMap = useMemo(
    () => new Map<string, any>(workstreams?.map((w: any) => [String(getId(w)), w]) ?? []),
    [workstreams]
  );

  // Fetch dropdown data
  useEffect(() => {
    (async () => {
      try {
        // @ts-ignore thunk types
        await dispatch(fetchProjects());
        // @ts-ignore thunk types
        await dispatch(fetchWorkstreams());
      } catch (err) {
        console.error(err);
      }
    })();
  }, [dispatch]);

  // Form state
  const [formData, setFormData] = useState({
    project: "",
    task: "",
    notes: "",
    hours: 0,
    minutes: 0,
  });

  const handleFormChange = (field: "project" | "task" | "notes" | "hours" | "minutes", value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Week days (Mon–Sun)
  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay(); // 0=Sun..6=Sat
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Totals (sum in minutes to avoid FP drift)
  const weekTotal = useMemo(() => {
    const keys = new Set(getWeekDays.map(toDateKey));
    const mins = timeEntries
      .filter((e) => keys.has(toDateKey(new Date(e.date))))
      .reduce((m, e) => m + Math.round(e.hours * 60), 0);
    return mins / 60;
  }, [timeEntries, getWeekDays]);

  const getEntriesForDay = useCallback(
    (date: Date) => {
      const key = toDateKey(date);
      return timeEntries.filter((e) => toDateKey(new Date(e.date)) === key);
    },
    [timeEntries]
  );

  const getDayTotal = useCallback(
    (date: Date) => {
      const mins = getEntriesForDay(date).reduce((m, e) => m + Math.round(e.hours * 60), 0);
      return mins / 60;
    },
    [getEntriesForDay]
  );

  // Nav handlers
  const handlePreviousWeek = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
  const handleNextWeek = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
  const handlePreviousDay = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const handleNextDay = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  const handleReturnToToday = () => setCurrentDate(new Date());
  const handleViewModeChange = (mode: ViewMode) => setViewMode(mode);

  const handleOpenModal = (date: Date | null = null) => {
    setSelectedDate(date || new Date());
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ project: "", task: "", notes: "", hours: 0, minutes: 0 });
  };

  const handleAddTimeEntry = () => {
    if (!selectedDate || !formData.project || !formData.task) return;

    const totalHours = toHours(formData.hours, formData.minutes);
    if (totalHours <= 0) return;

    const newEntry: TimeEntry = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: selectedDate,
      project: String(formData.project),   // project id
      task: String(formData.task),         // workstream id
      notes: formData.notes,
      hours: totalHours,
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    handleCloseModal();
  };

  const handleDeleteEntry = (entryId: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const getDayName = (date: Date) => date.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1f2937", mb: 1 }}>
            Time Tracking
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Track your time across projects and tasks
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal(null)}
          sx={{
            bgcolor: "#10b981",
            color: "white",
            textTransform: "none",
            px: 3,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": { bgcolor: "#059669" },
          }}
        >
          Track time
        </Button>
      </Box>

      {/* Navigation */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={viewMode === "week" ? handlePreviousWeek : handlePreviousDay}
              size="small"
              sx={{ border: "1px solid #e5e7eb", "&:hover": { bgcolor: "#f3f4f6" } }}
              aria-label="Previous"
            >
              <ChevronLeft />
            </IconButton>

            <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 200, textAlign: "center" }}>
              {viewMode === "week"
                ? `${formatDate(getWeekDays[0])} - ${formatDate(getWeekDays[6])}`
                : formatDate(currentDate)}
            </Typography>

            <IconButton
              onClick={viewMode === "week" ? handleNextWeek : handleNextDay}
              size="small"
              sx={{ border: "1px solid #e5e7eb", "&:hover": { bgcolor: "#f3f4f6" } }}
              aria-label="Next"
            >
              <ChevronRight />
            </IconButton>

            <Button
              variant="text"
              onClick={handleReturnToToday}
              sx={{
                textTransform: "none",
                color: "#3b82f6",
                fontWeight: 500,
                "&:hover": { bgcolor: alpha("#3b82f6", 0.1) },
              }}
            >
              Return to today
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant={viewMode === "day" ? "contained" : "outlined"}
              startIcon={<CalendarMonth />}
              onClick={() => handleViewModeChange("day")}
              sx={{
                textTransform: "none",
                ...(viewMode === "day"
                  ? { bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }
                  : {
                      borderColor: "#e5e7eb",
                      color: "#1f2937",
                      "&:hover": { borderColor: "#3b82f6", bgcolor: alpha("#3b82f6", 0.05) },
                    }),
              }}
            >
              Day
            </Button>
            <Button
              variant={viewMode === "week" ? "contained" : "outlined"}
              onClick={() => handleViewModeChange("week")}
              sx={{
                textTransform: "none",
                ...(viewMode === "week"
                  ? { bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }
                  : {
                      borderColor: "#e5e7eb",
                      color: "#1f2937",
                      "&:hover": { borderColor: "#3b82f6", bgcolor: alpha("#3b82f6", 0.05) },
                    }),
              }}
            >
              Week
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Day view */}
      {viewMode === "day" && (
        <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: "2px solid #e5e7eb", bgcolor: "#fafafa" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937", mb: 0.5 }}>
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Track your time for the day
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5 }}>
                  Total hours
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#10b981" }}>
                  {formatHours(getDayTotal(currentDate))}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            {getEntriesForDay(currentDate).length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {getEntriesForDay(currentDate).map((entry) => {
                  const project = projectMap.get(entry.project);
                  const workstream = workstreamMap.get(entry.task);

                  return (
                    <Box
                      key={entry.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 3,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        bgcolor: "white",
                        "&:hover": { boxShadow: 2, borderColor: "#3b82f6" },
                        transition: "all 0.2s",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                          <Typography variant="h6" sx={{ color: "#3b82f6", fontWeight: 600 }}>
                            {project?.name ?? entry.project}
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#6b7280" }}>
                            •
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#1f2937", fontWeight: 500 }}>
                            {workstream?.name ?? entry.task}
                          </Typography>
                        </Box>
                        {entry.notes && (
                          <Typography variant="body2" sx={{ color: "#6b7280", mt: 1 }}>
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
                            fontSize: "1rem",
                            height: 36,
                            px: 1,
                          }}
                        />
                        <IconButton aria-label="Edit time entry" size="medium" sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) } }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="Delete time entry"
                          size="medium"
                          onClick={() => handleDeleteEntry(entry.id)}
                          sx={{ color: "#6b7280", "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
                <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
                  No time entries for this day
                </Typography>
                <Typography variant="body2" sx={{ color: "#d1d5db", mb: 3 }}>
                  Click "Track time" to add your first entry
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenModal(currentDate)}
                  sx={{ bgcolor: "#10b981", color: "white", textTransform: "none", px: 3, py: 1.5, "&:hover": { bgcolor: "#059669" } }}
                >
                  Add time entry
                </Button>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              borderTop: "2px solid #e5e7eb",
              p: 3,
              bgcolor: "#fafafa",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Typography variant="body1" sx={{ color: "#6b7280", fontWeight: 500 }}>
              Day total
            </Typography>
            <Typography variant="h5" sx={{ color: "#1f2937", fontWeight: 700 }}>
              {formatHours(getDayTotal(currentDate))}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Week view */}
      {viewMode === "week" && (
        <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {/* Week header */}
          <Box sx={{ display: "flex", borderBottom: "2px solid #e5e7eb", bgcolor: "#fafafa" }}>
            {getWeekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayTotal = getDayTotal(day);
              return (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    borderRight: index < 6 ? "1px solid #e5e7eb" : "none",
                    p: 2,
                    textAlign: "center",
                    bgcolor: isToday ? alpha("#3b82f6", 0.05) : "transparent",
                  }}
                  onDoubleClick={() => handleOpenModal(day)}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: isToday ? "#3b82f6" : "#6b7280", fontWeight: isToday ? 700 : 500, display: "block", mb: 0.5 }}
                  >
                    {getDayName(day)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isToday ? "#3b82f6" : "#1f2937", fontWeight: isToday ? 700 : 600, fontSize: "0.875rem" }}>
                    {day.getDate()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: dayTotal > 0 ? "#10b981" : "#9ca3af", fontWeight: 600, display: "block", mt: 0.5 }}>
                    {formatHours(dayTotal)}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Week grid body */}
          <Box sx={{ display: "flex", minHeight: 150 }}>
            {getWeekDays.map((day, index) => {
              const dayTotal = getDayTotal(day);
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    borderRight: index < 6 ? "1px solid #e5e7eb" : "none",
                    p: 2,
                    bgcolor: isToday ? alpha("#3b82f6", 0.02) : "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {dayTotal > 0 ? (
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          bgcolor: alpha("#10b981", 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                          border: "2px solid #10b981",
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 700 }}>
                          {formatHours(dayTotal)}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: "#d1d5db" }}>
                      No entries
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              borderTop: "2px solid #e5e7eb",
              p: 2,
              bgcolor: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  borderColor: "#e5e7eb",
                  color: "#6b7280",
                  "&:hover": { borderColor: "#3b82f6", color: "#3b82f6" },
                }}
              >
                Copy rows from most recent timesheet
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{ textTransform: "none", bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
              >
                Submit week for approval
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500 }}>
                Week total
              </Typography>
              <Typography variant="h6" sx={{ color: "#1f2937", fontWeight: 700 }}>
                {formatHours(weekTotal)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Flat list of entries (week mode) */}
      {viewMode === "week" && timeEntries.length > 0 && (
        <Paper elevation={0} sx={{ mt: 3, border: "1px solid #e5e7eb" }}>
          <Box sx={{ p: 2, bgcolor: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937" }}>
              Time Entries
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {timeEntries.map((entry) => {
              const project = projectMap.get(entry.project);
              const workstream = workstreamMap.get(entry.task);

              return (
                <Box
                  key={entry.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    mb: 1,
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                    bgcolor: "white",
                    "&:hover": { boxShadow: 1, borderColor: "#3b82f6" },
                    transition: "all 0.2s",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                      <Chip
                        label={formatDate(new Date(entry.date))}
                        size="small"
                        sx={{ bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6", fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ color: "#3b82f6", fontWeight: 600 }}>
                        {project?.name ?? entry.project}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        •
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#1f2937" }}>
                        {workstream?.name ?? entry.task}
                      </Typography>
                    </Box>
                    {entry.notes && (
                      <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        {entry.notes}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label={formatHours(entry.hours)}
                      sx={{ bgcolor: alpha("#10b981", 0.1), color: "#10b981", fontWeight: 700, fontSize: "0.875rem", height: 32 }}
                    />
                    <IconButton aria-label="Edit time entry" size="small" sx={{ color: "#6b7280", "&:hover": { color: "#3b82f6", bgcolor: alpha("#3b82f6", 0.1) } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Delete time entry"
                      size="small"
                      onClick={() => handleDeleteEntry(entry.id)}
                      sx={{ color: "#6b7280", "&:hover": { color: "#ef4444", bgcolor: alpha("#ef4444", 0.1) } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Add/Edit dialog */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        aria-labelledby="time-entry-title"
      >
        <DialogTitle id="time-entry-title" sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            New time entry for {selectedDate && formatDate(selectedDate)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {/* Projects from Redux */}
            <TextField
              select
              label="Project"
              value={formData.project}
              onChange={(e) => handleFormChange("project", e.target.value)}
              fullWidth
              size="medium"
            >
              {(projects ?? []).map((p: any) => {
                const id = String(getId(p));
                return (
                  <MenuItem key={id} value={id}>
                    {p.name} {p.code ? `(${p.code})` : ""}
                  </MenuItem>
                );
              })}
            </TextField>

            {/* Workstreams from Redux */}
            <TextField
              select
              label="Work Stream"
              value={formData.task}
              onChange={(e) => handleFormChange("task", e.target.value)}
              fullWidth
              size="medium"
              disabled={!formData.project && (workstreams?.length ?? 0) > 0 ? false : false}
            >
              {(workstreams ?? []).map((w: any) => {
                const id = String(getId(w));
                return (
                  <MenuItem key={id} value={id}>
                    {w.name}
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              label="Notes (optional)"
              value={formData.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
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
                  onChange={(e) => handleFormChange("hours", clamp(parseInt(e.target.value) || 0, 0, 24))}
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
                  onChange={(e) => handleFormChange("minutes", clamp(parseInt(e.target.value) || 0, 0, 59))}
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
            onClick={handleCloseModal}
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
            onClick={handleAddTimeEntry}
            variant="contained"
            disabled={!formData.project || !formData.task || (formData.hours === 0 && formData.minutes === 0)}
            sx={{
              textTransform: "none",
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
            }}
          >
            Add Time Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTrackManagement;
