import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  alpha,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Add as AddIcon,
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchProjectsWithoutParams } from "../../../store/actions/projectActions";
import { fetchWorkstreams } from "../../../store/actions/workstreamActions";
import {
  createTimeTrackTask,
  getTaskList,
  deleteTimeTrackTask,
  updateTimeTrackTask,
  finalSubmitTimeTrackTask,
} from "../../../store/actions/timeTrackActions";
import { toast } from "react-toastify";
import TimeTrackManagementModal from "./TimeTrackManagementModal";
import TimeEntryCard from "./TimeEntryCard";
import TimeEntryList from "./TimeEntryList";
import type {
  TimeEntry,
  TimeTrackTask,
} from "../../../utils/interfaces/TimeTrackInterface";
import {
  getDisplayId,
  toDateKey,
  formatHours,
  toHours,
  getDayName,
  formatDate,
  toISODate,
  getWeekStart,
  getWeekEnd,
} from "../../../utils/common/helpers";

type ViewMode = "day" | "week";

const TimeTrackManagement = () => {
  const dispatch = useAppDispatch();

  const projects = useAppSelector((s) => s.project?.projects ?? []);
  const workstreams = useAppSelector((s) => s.workstream?.workstreams ?? []);
  const tasks = useAppSelector((s) => s.task?.tasks ?? []);
  const isLoading = useAppSelector((s) => s.task?.isLoading ?? false);

  const getProjectName = useCallback(
    (id: string) =>
      projects.find((p: any) => String(getDisplayId(p)) === id)?.name ?? id,
    [projects]
  );
  const getWorkstreamName = useCallback(
    (id: string) =>
      workstreams.find((w: any) => String(getDisplayId(w)) === id)?.name ?? id,
    [workstreams]
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project: "",
    task: "",
    notes: "",
    hours: 0,
    minutes: 0,
  });

 
  const convertTaskToEntry = useCallback((task: TimeTrackTask): TimeEntry => {
     const getIdString = (field: any): string => {
      if (!field) return "";
      if (typeof field === "string") return field;
      if (typeof field === "object" && field._id) return String(field._id);
      return String(field);
    };

    return {
      id: task._id || "",
      date: task.date ? new Date(task.date) : new Date(),
      project: getIdString(task.projectId),
      task: getIdString(task.workstreamId),
      notes: task.taskDescription || "",
      hours: parseFloat(task.spendHours || "0"),
      finalSubmit: task.finalSubmit || false,
    };
  }, []);

  const convertEntryToTask = useCallback(
    (entry: TimeEntry) => {
      return {
        projectId: entry.project,
        workstreamId: entry.task,
        taskDescription: entry.notes,
        date: entry.date.toISOString().split("T")[0],
        spendHours: entry.hours.toString(),
      };
    },
    []
  );

  const fetchReferenceData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchProjectsWithoutParams()).unwrap(),
        dispatch(fetchWorkstreams({ page: 1, limit: 1000 })).unwrap(),
      ]);
    } catch {
      toast.error("Failed to load reference data");
    }
  }, [dispatch]);

  const fetchTasks = useCallback(async () => {
    try {
      let startDate: string;
      let endDate: string;

      if (viewMode === "week") {
         startDate = toISODate(getWeekStart(currentDate));
        endDate = toISODate(getWeekEnd(currentDate));
      } else {
         startDate = toISODate(currentDate);
        endDate = toISODate(currentDate);
      }

      await dispatch(getTaskList({ startDate, endDate })).unwrap();
    } catch {
      toast.error("Failed to load time entries");
    }
  }, [dispatch, currentDate, viewMode]);

  useEffect(() => {
    fetchReferenceData();
    fetchTasks();
  }, [fetchReferenceData, fetchTasks]);

  useEffect(() => {
    const entries = tasks.map(convertTaskToEntry);
    setTimeEntries(entries);
  }, [tasks, convertTaskToEntry]);

  const handleFormChange = (
    field: "project" | "task" | "notes" | "hours" | "minutes",
    value: string | number
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

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
      const mins = getEntriesForDay(date).reduce(
        (m, e) => m + Math.round(e.hours * 60),
        0
      );
      return mins / 60;
    },
    [getEntriesForDay]
  );

  const handlePreviousWeek = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)
    );
  const handleNextWeek = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
    );
  const handlePreviousDay = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
    );
  const handleNextDay = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    );
  const handleReturnToToday = () => setCurrentDate(new Date());
  const handleViewModeChange = (mode: ViewMode) => setViewMode(mode);

  const handleOpenModal = (date: Date | null = null) => {
    setSelectedDate(date || new Date());
    setEditingEntryId(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingEntryId(null);
    setFormData({ project: "", task: "", notes: "", hours: 0, minutes: 0 });
  };

  const handleEditEntry = (entryId: string) => {
    const entry = timeEntries.find((e) => e.id === entryId);
    if (!entry) return;

     if (entry.finalSubmit) {
      toast.warning("Cannot edit a submitted time entry");
      return;
    }

    const totalMinutes = Math.round(entry.hours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    setEditingEntryId(entryId);
    setSelectedDate(new Date(entry.date));
    setFormData({
      project: entry.project,
      task: entry.task,
      notes: entry.notes,
      hours,
      minutes,
    });
    setOpenModal(true);
  };

  const handleAddTimeEntry = async () => {
    if (!selectedDate || !formData.project || !formData.task) return;

    const totalHours = toHours(formData.hours, formData.minutes);
    if (totalHours <= 0) return;

    const entry: TimeEntry = {
      id: editingEntryId || crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: selectedDate,
      project: String(formData.project),
      task: String(formData.task),
      notes: formData.notes,
      hours: totalHours,
    };

    try {
      const taskPayload = convertEntryToTask(entry);
      
      if (editingEntryId) {
        await dispatch(updateTimeTrackTask({ 
          params: { id: editingEntryId }, 
          data: taskPayload 
        })).unwrap();
        toast.success("Time entry updated successfully");
      } else {
        await dispatch(createTimeTrackTask(taskPayload)).unwrap();
        toast.success("Time entry added successfully");
      }
      
      handleCloseModal();
      await fetchTasks();
    } catch (error) {
      toast.error(editingEntryId ? "Failed to update time entry" : "Failed to add time entry");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const entry = timeEntries.find((e) => e.id === entryId);
    if (entry?.finalSubmit) {
      toast.warning("Cannot delete a submitted time entry");
      return;
    }

    try {
      await dispatch(deleteTimeTrackTask(entryId)).unwrap();
      toast.success("Time entry deleted successfully");
      await fetchTasks();
    } catch (error) {
      toast.error("Failed to delete time entry");
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const startDate = toISODate(getWeekStart(currentDate));
      const endDate = toISODate(getWeekEnd(currentDate));
      
      await dispatch(finalSubmitTimeTrackTask({ startDate, endDate })).unwrap();
      toast.success("Time entries submitted successfully");
      await fetchTasks();
    } catch (error) {
      toast.error("Failed to submit time entries");
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: "#1f2937", mb: 1 }}
          >
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

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={
                viewMode === "week" ? handlePreviousWeek : handlePreviousDay
              }
              size="small"
              sx={{
                border: "1px solid #e5e7eb",
                "&:hover": { bgcolor: "#f3f4f6" },
              }}
              aria-label="Previous"
            >
              <ChevronLeft />
            </IconButton>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, minWidth: 200, textAlign: "center" }}
            >
              {viewMode === "week"
                ? `${formatDate(getWeekDays[0])} - ${formatDate(getWeekDays[6])}`
                : formatDate(currentDate)}
            </Typography>

            <IconButton
              onClick={viewMode === "week" ? handleNextWeek : handleNextDay}
              size="small"
              sx={{
                border: "1px solid #e5e7eb",
                "&:hover": { bgcolor: "#f3f4f6" },
              }}
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
                      "&:hover": {
                        borderColor: "#3b82f6",
                        bgcolor: alpha("#3b82f6", 0.05),
                      },
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
                      "&:hover": {
                        borderColor: "#3b82f6",
                        bgcolor: alpha("#3b82f6", 0.05),
                      },
                    }),
              }}
            >
              Week
            </Button>
          </Box>
        </Box>
      </Paper>

      {viewMode === "day" && (
        <Paper
          elevation={0}
          sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}
        >
          <Box
            sx={{ p: 3, borderBottom: "2px solid #e5e7eb", bgcolor: "#fafafa" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1f2937", mb: 0.5 }}
                >
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
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", display: "block", mb: 0.5 }}
                >
                  Total hours
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#10b981" }}
                >
                  {formatHours(getDayTotal(currentDate))}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            {getEntriesForDay(currentDate).length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {getEntriesForDay(currentDate).map((entry) => (
                  <TimeEntryCard
                    key={entry.id}
                    entry={entry}
                    getProjectName={getProjectName}
                    getWorkstreamName={getWorkstreamName}
                    onDelete={handleDeleteEntry}
                    onEdit={handleEditEntry}
                  />
                ))}
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
                  sx={{
                    bgcolor: "#10b981",
                    color: "white",
                    textTransform: "none",
                    px: 3,
                    py: 1.5,
                    "&:hover": { bgcolor: "#059669" },
                  }}
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
            <Typography
              variant="body1"
              sx={{ color: "#6b7280", fontWeight: 500 }}
            >
              Day total
            </Typography>
            <Typography variant="h5" sx={{ color: "#1f2937", fontWeight: 700 }}>
              {formatHours(getDayTotal(currentDate))}
            </Typography>
          </Box>
        </Paper>
      )}

      {viewMode === "week" && (
        <Paper
          elevation={0}
          sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}
        >
          <Box
            sx={{
              display: "flex",
              borderBottom: "2px solid #e5e7eb",
              bgcolor: "#fafafa",
            }}
          >
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
                    sx={{
                      color: isToday ? "#3b82f6" : "#6b7280",
                      fontWeight: isToday ? 700 : 500,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {getDayName(day)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isToday ? "#3b82f6" : "#1f2937",
                      fontWeight: isToday ? 700 : 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: dayTotal > 0 ? "#10b981" : "#9ca3af",
                      fontWeight: 600,
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {formatHours(dayTotal)}
                  </Typography>
                </Box>
              );
            })}
          </Box>

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
                        <Typography
                          variant="h6"
                          sx={{ color: "#10b981", fontWeight: 700 }}
                        >
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
                sx={{
                  textTransform: "none",
                  bgcolor: "#3b82f6",
                  "&:hover": { bgcolor: "#2563eb" },
                }}
                onClick={handleFinalSubmit}
              >
                Submit week for approval
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", fontWeight: 500 }}
              >
                Week total
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#1f2937", fontWeight: 700 }}
              >
                {formatHours(weekTotal)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {viewMode === "week" && (
        <TimeEntryList
          entries={timeEntries}
          getProjectName={getProjectName}
          getWorkstreamName={getWorkstreamName}
          onDelete={handleDeleteEntry}
          onEdit={handleEditEntry}
          showDate
        />
      )}

      <TimeTrackManagementModal
        open={openModal}
        selectedDate={selectedDate}
        projects={projects}
        workstreams={workstreams}
        formData={formData}
        onClose={handleCloseModal}
        onFormChange={handleFormChange}
        onSubmit={handleAddTimeEntry}
        getDisplayId={getDisplayId}
        isEditMode={!!editingEntryId}
      />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default TimeTrackManagement;
