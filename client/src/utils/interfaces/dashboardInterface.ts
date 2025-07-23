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
  