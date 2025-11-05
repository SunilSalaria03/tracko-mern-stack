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
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../store";
import {   fetchAssignedProjects, } from "../../../store/actions/projectActions";
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

   const projectAssignments = useAppSelector((s) => s.project?.projectAssignments ?? []);
  const workstreams = useAppSelector((s) => s.workstream?.workstreams ?? []);
  const tasks = useAppSelector((s) => s.task?.tasks ?? []);
  const isLoading = useAppSelector((s) => s.task?.isLoading ?? false);

console.log({projectAssignments});

  const getProjectName = useCallback(
    (id: string) =>
      projectAssignments.find((p: any) => String(getDisplayId(p)) === id)?.name ?? id,
    [projectAssignments]
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
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

  const convertEntryToTask = useCallback((entry: TimeEntry) => {
    return {
      projectId: entry.project,
      workstreamId: entry.task,
      taskDescription: entry.notes,
      date: toISODate(entry.date),
      spendHours: entry.hours.toString(),
    };
  }, []);

  const fetchReferenceData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchAssignedProjects()).unwrap(),
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

  const handleOpenModal = (
    date: Date | null = null,
    preSelectedProject?: string,
    preSelectedTask?: string
  ) => {
    setSelectedDate(date || new Date());
    setEditingEntryId(null);
    setFormData({
      project: preSelectedProject || "",
      task: preSelectedTask || "",
      notes: "",
      hours: 0,
      minutes: 0,
    });
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
      id:
        editingEntryId ||
        crypto.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: selectedDate,
      project: String(formData.project),
      task: String(formData.task),
      notes: formData.notes,
      hours: totalHours,
    };

    try {
      const taskPayload = convertEntryToTask(entry);

      if (editingEntryId) {
        await dispatch(
          updateTimeTrackTask({
            params: { id: editingEntryId },
            data: taskPayload,
          })
        ).unwrap();
        toast.success("Time entry updated successfully");
      } else {
        await dispatch(createTimeTrackTask(taskPayload)).unwrap();
        toast.success("Time entry added successfully");
      }

      handleCloseModal();
      await fetchTasks();
    } catch (error) {
      toast.error(
        editingEntryId
          ? "Failed to update time entry"
          : "Failed to add time entry"
      );
    }
  };

  const handleDeleteClick = (entryId: string) => {
    const entry = timeEntries.find((e) => e.id === entryId);
    if (entry?.finalSubmit) {
      toast.warning("Cannot delete a submitted time entry");
      return;
    }
    setEntryToDelete(entryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      await dispatch(deleteTimeTrackTask(entryToDelete)).unwrap();
      toast.success("Time entry deleted successfully");
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      await fetchTasks();
    } catch (error) {
      toast.error("Failed to delete time entry");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const handleFinalSubmit = async () => {
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
          onClick={() => handleOpenModal(viewMode === "day" ? currentDate : null)}
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
        <>
          <Paper
            elevation={0}
            sx={{ border: "1px solid #e5e7eb", overflow: "hidden", mb: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {getWeekDays.map((day, index) => {
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const isSelected =
                  day.toDateString() === currentDate.toDateString();
                const dayTotal = getDayTotal(day);
                return (
                  <Box
                    key={index}
                    onClick={() => setCurrentDate(new Date(day))}
                    sx={{
                      flex: 1,
                      borderRight: index < 6 ? "1px solid #e5e7eb" : "none",
                      p: 2,
                      textAlign: "center",
                      bgcolor: isSelected
                        ? "#3b82f6"
                        : isToday
                          ? alpha("#3b82f6", 0.05)
                          : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: isSelected ? "#2563eb" : alpha("#3b82f6", 0.1),
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: isSelected
                          ? "white"
                          : isToday
                            ? "#3b82f6"
                            : "#6b7280",
                        fontWeight: isSelected ? 700 : isToday ? 600 : 500,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {getDayName(day)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isSelected
                          ? "white"
                          : isToday
                            ? "#3b82f6"
                            : "#1f2937",
                        fontWeight: isSelected ? 700 : isToday ? 600 : 500,
                        fontSize: "0.875rem",
                        mb: 0.5,
                      }}
                    >
                      {day.getDate()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isSelected
                          ? "white"
                          : dayTotal > 0
                            ? "#10b981"
                            : "#9ca3af",
                        fontWeight: 600,
                        display: "block",
                      }}
                    >
                      {formatHours(dayTotal)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* Day Details */}
          <Paper
            elevation={0}
            sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}
          >
            <Box sx={{ p: 2 }}>
              {getEntriesForDay(currentDate).length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {getEntriesForDay(currentDate).map((entry) => (
                    <Box
                      key={entry.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 2,
                        px: 2,
                        borderBottom: "1px solid #e5e7eb",
                        "&:hover": { bgcolor: "#f9fafb" },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "#1f2937", mb: 0.5 }}
                        >
                          {getProjectName(entry.project)} (
                          {getWorkstreamName(entry.task)})
                        </Typography>
                      
                        {entry.notes && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#3b82f6",
                              fontSize: "0.8rem",
                              wordBreak: "break-all",
                            }}
                          >
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          ml: 3,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#1f2937",
                            minWidth: 60,
                          }}
                        >
                          {formatHours(entry.hours)}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={entry.finalSubmit}
                          onClick={() => handleEditEntry(entry.id)}
                          sx={{
                            textTransform: "none",
                            borderColor: "#e5e7eb",
                            color: "#1f2937",
                            minWidth: 60,
                            "&:hover": {
                              borderColor: "#3b82f6",
                              bgcolor: alpha("#3b82f6", 0.05),
                            },
                          }}
                        >
                          {entry.finalSubmit ? "Submitted" : "Edit"}
                        </Button>
                        <IconButton
                          size="small"
                          disabled={entry.finalSubmit}
                          onClick={() => handleDeleteClick(entry.id)}
                          sx={{
                            color: "#ef4444",
                            "&:hover": {
                              bgcolor: alpha("#ef4444", 0.1),
                            },
                            "&:disabled": {
                              color: "#d1d5db",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
                  <Typography variant="h6" sx={{ color: "#9ca3af", mb: 2 }}>
                    No time entries for this day
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#d1d5db" }}>
                    Click "Track time" to add your first entry
                  </Typography>
                </Box>
              )}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="body1"
                  sx={{ color: "#6b7280", fontWeight: 500 }}
                >
                  Total:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#1f2937", fontWeight: 700 }}
                >
                  {formatHours(getDayTotal(currentDate))}
                </Typography>
              </Box>
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  bgcolor: "#3b82f6",
                  "&:hover": { bgcolor: "#2563eb" },
                }}
                onClick={handleFinalSubmit}
                disabled={getEntriesForDay(currentDate).length === 0}
              >
                Submit for approval
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {viewMode === "week" && (
        <Paper
          elevation={0}
          sx={{ border: "1px solid #e5e7eb", overflow: "auto" }}
        >
          <Box sx={{ minWidth: 1200 }}>
            {/* Table Header */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "3fr repeat(7, 1fr) 1fr",
                borderBottom: "2px solid #e5e7eb",
                bgcolor: "#f9fafb",
              }}
            >
              <Box sx={{ p: 1.5, borderRight: "1px solid #e5e7eb" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  Task
                </Typography>
              </Box>
              {getWeekDays.map((day, index) => {
                const isToday =
                  day.toDateString() === new Date().toDateString();
                return (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRight: "1px solid #e5e7eb",
                      textAlign: "center",
                      bgcolor: isToday ? alpha("#3b82f6", 0.05) : "transparent",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: isToday ? "#3b82f6" : "#6b7280",
                        fontWeight: 600,
                        display: "block",
                      }}
                    >
                      {getDayName(day)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isToday ? "#3b82f6" : "#1f2937",
                        fontWeight: 500,
                      }}
                    >
                      {day.getDate()}{" "}
                      {day.toLocaleDateString("en-US", { month: "short" })}
                    </Typography>
                  </Box>
                );
              })}
              <Box sx={{ p: 1.5, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  Week total
                </Typography>
              </Box>
            </Box>

            {/* Group entries by task */}
            {(() => {
              const taskGroups = new Map<string, TimeEntry[]>();
              timeEntries.forEach((entry) => {
                const key = `${entry.project}-${entry.task}`;
                if (!taskGroups.has(key)) {
                  taskGroups.set(key, []);
                }
                taskGroups.get(key)!.push(entry);
              });

              return Array.from(taskGroups.entries()).map(([key, entries]) => {
                const [projectId, taskId] = key.split("-");
                const rowTotal = entries.reduce((sum, e) => sum + e.hours, 0);

                return (
                  <Box
                    key={key}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "3fr repeat(7, 1fr) 1fr",
                      borderBottom: "1px solid #e5e7eb",
                      "&:hover": { bgcolor: "#f9fafb" },
                    }}
                  >
                     <Box
                      sx={{
                        p: 1.5,
                        borderRight: "1px solid #e5e7eb",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1f2937", mb: 0.3 }}
                      >
                        {getProjectName(projectId)} ({getWorkstreamName(taskId)}
                        )
                      </Typography>
                     
                    </Box>

                    {/* Day Columns */}
                    {getWeekDays.map((day, dayIndex) => {
                      const dayKey = toDateKey(day);
                      const dayEntry = entries.find(
                        (e) => toDateKey(new Date(e.date)) === dayKey
                      );
                      const isToday =
                        day.toDateString() === new Date().toDateString();

                      return (
                        <Box
                          key={dayIndex}
                          sx={{
                            p: 1,
                            borderRight: "1px solid #e5e7eb",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: isToday
                              ? alpha("#3b82f6", 0.02)
                              : "transparent",
                            cursor: "pointer",
                            "&:hover": { bgcolor: alpha("#3b82f6", 0.08) },
                          }}
                          onClick={() => {
                            if (dayEntry) {
                              handleEditEntry(dayEntry.id);
                            } else {
                              handleOpenModal(day, projectId, taskId);
                            }
                          }}
                        >
                          {dayEntry ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: dayEntry.finalSubmit
                                  ? "#6b7280"
                                  : "#1f2937",
                              }}
                            >
                              {formatHours(dayEntry.hours)}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ color: "#d1d5db" }}
                            >
                              -
                            </Typography>
                          )}
                        </Box>
                      );
                    })}

                    {/* Week Total Column */}
                    <Box
                      sx={{
                        p: 1.5,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#f9fafb",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#1f2937" }}
                      >
                        {formatHours(rowTotal)}
                      </Typography>
                    </Box>
                  </Box>
                );
              });
            })()}

            {/* Day Totals Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "3fr repeat(7, 1fr) 1fr",
                borderTop: "2px solid #e5e7eb",
                bgcolor: "#f9fafb",
              }}
            >
              <Box sx={{ p: 1.5, borderRight: "1px solid #e5e7eb" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  Total
                </Typography>
              </Box>
              {getWeekDays.map((day, index) => {
                const dayTotal = getDayTotal(day);
                const isToday =
                  day.toDateString() === new Date().toDateString();
                return (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRight: "1px solid #e5e7eb",
                      textAlign: "center",
                      bgcolor: isToday ? alpha("#3b82f6", 0.05) : "transparent",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#1f2937" }}
                    >
                      {formatHours(dayTotal)}
                    </Typography>
                  </Box>
                );
              })}
              <Box
                sx={{
                  p: 1.5,
                  textAlign: "center",
                  bgcolor: "#e0f2fe",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#0369a1" }}
                >
                  {formatHours(weekTotal)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
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
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal(getWeekDays[currentDate.getDay()-1])}
                sx={{
                  textTransform: "none",
                  borderColor: "#e5e7eb",
                  color: "#6b7280",
                  "&:hover": { borderColor: "#10b981", color: "#10b981" },
                }}
              >
                Add row
              </Button>
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                Save
              </Button>
            </Box>
            <Button
              variant="contained"
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
        </Paper>
      )}

      <TimeTrackManagementModal
        open={openModal}
        selectedDate={selectedDate}
        projects={projectAssignments}
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

       <TimeTrackDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

 const TimeTrackDeleteDialog = ({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <Paper
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: open ? "translate(-50%, -50%)" : "translate(-50%, -50%) scale(0.9)",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transition: "all 0.2s",
        zIndex: 1300,
        p: 3,
        maxWidth: 400,
        width: "90%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ef4444", mb: 1 }}>
          Delete Time Entry
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Are you sure you want to delete this time entry? This action cannot be undone.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          onClick={onCancel}
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
          onClick={onConfirm}
          variant="contained"
          sx={{
            textTransform: "none",
            bgcolor: "#ef4444",
            "&:hover": { bgcolor: "#dc2626" },
          }}
        >
          Delete
        </Button>
      </Box>
      {open && (
        <Box
          onClick={onCancel}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: -1,
          }}
        />
      )}
    </Paper>
  );
};

export default TimeTrackManagement;
