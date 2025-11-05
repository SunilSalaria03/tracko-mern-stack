export interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    path?: string;
    onClick?: () => void;
  }
  
  export interface DashboardStats {
    totalSessions: number;
    processes: number;
    processVersions: number;
    activeUsers: number;
  }
  
  export interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }[];
  }

  export interface ProjectHours {
    projectId: string;
    projectName: string;
    productiveHours: number;
    color: string;
  }

  export interface ProductiveHoursSummary {
    today: ProjectHours[];
    week: ProjectHours[];
    month: ProjectHours[];
    lastMonth: ProjectHours[];
  }

  export type TimePeriod = 'today' | 'week' | 'month' | 'lastMonth';

  // API Response types
  export interface ProjectStats {
    projectId: string;
    projectName: string;
    productiveHours: number;
    color: string;
  }

  export interface DashboardStatsResponse {
    period: TimePeriod;
    projects: ProjectStats[];
    totalProductiveHours: number;
    activeProjects: number;
    averageDailyHours: number;
  }

  export interface DashboardParams {
    period?: TimePeriod;
  }
  