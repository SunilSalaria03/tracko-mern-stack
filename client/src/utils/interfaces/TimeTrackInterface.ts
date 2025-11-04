export interface TimeEntry {
  id: string;
  date: Date;
  project: string;
  task: string;
  notes: string;
  hours: number;
  finalSubmit?: boolean;
}
export interface TimeEntryPayload {
  _id?: string;
  projectId?: string;
  workstreamId?: string;
  taskDescription?: string;
  date?: string;
  spendHours?: string;
}
export interface TimeTrackListParams {
  page?: number;
  perPageLimit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface FinalSubmitPayload {
  startDate: string;
  endDate: string;
}

export interface TimeTrackTaskResponse {
    userTasks: TimeTrackTask[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  export interface TimeTrackTask{
    _id?:string;
    userId?:string | { _id: string; name: string; email?: string };
    projectId?:string | { _id: string; name: string };
    workstreamId?:string | { _id: string; name: string };
    taskDescription?:string;
    date?:string;
    spendHours?:string;
    addedBy?:string | { _id: string; name: string; email?: string };
    finalSubmit?:boolean;
    isDeleted?:boolean;
    createdAt?:string;
    updatedAt?:string;
  }
export interface TimeEntryListProps {
  entries: TimeEntry[];
  getProjectName: (id: string) => string;
  getWorkstreamName: (id: string) => string;
  onDelete: (entryId: string) => void;
  onEdit?: (entryId: string) => void;
  title?: string;
  showDate?: boolean;
}

export interface TimeEntryCardProps {
  entry: {
    id: string;
    date: Date;
    project: string;
    task: string;
    notes: string;
    hours: number;
    finalSubmit?: boolean;
  };
  getProjectName: (id: string) => string;
  getWorkstreamName: (id: string) => string;
  onDelete: (entryId: string) => void;
  onEdit?: (entryId: string) => void;
  showDate?: boolean;
  compact?: boolean;
}

export interface TimeTrackManagementModalProps {
  open: boolean;
  selectedDate: Date | null;
  projects: any[];
  workstreams: any[];
  formData: {
    project: string;
    task: string;
    notes: string;
    hours: number;
    minutes: number;
  };
  onClose: () => void;
  onFormChange: (
    field: "project" | "task" | "notes" | "hours" | "minutes",
    value: string | number
  ) => void;
  onSubmit: () => void;
  getDisplayId: (o: any) => string;
  isEditMode?: boolean;
}
