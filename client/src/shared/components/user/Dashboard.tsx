import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import type {
  TimePeriod,
} from "../../../utils/interfaces/dashboardInterface";
import { styled } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getDashboardStats } from "../../../store/actions/dashboardActions";

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#F8FAFB',
  padding: theme.spacing(4),
}));

const StyledCard = styled(Card)(() => ({
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  background: '#FFFFFF',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const StatCard = styled(Card)(() => ({
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  background: '#FFFFFF',
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today");
  
  const { 
    projects, 
    totalProductiveHours, 
    activeProjects, 
    averageDailyHours,
    isLoading, 
    error 
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboardStats({ period: selectedPeriod }));
  }, [dispatch, selectedPeriod]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  const periodLabels = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    lastMonth: "Last Month",
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="60vh"
        >
          <CircularProgress size={60} />
        </Box>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <Box maxWidth="1200px" mx="auto">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#111827',
                  fontSize: '2rem',
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                Project Dashboard
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6B7280',
                  fontSize: '0.95rem',
                }}
              >
                Track and analyze your productive hours across projects
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<TimerIcon />}
              onClick={() => navigate("/time")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                background: '#2563EB',
                color: '#fff',
                px: 3,
                py: 1.25,
                '&:hover': {
                  background: '#1D4ED8',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              Track Time
            </Button>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 3,
          }}
        >
          <StatCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccessTimeIcon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontWeight: 500 }}>
                Total Hours ({periodLabels[selectedPeriod]})
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.875rem' }}>
                {totalProductiveHours.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                hours tracked
              </Typography>
            </CardContent>
          </StatCard>
          
          <StatCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderIcon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontWeight: 500 }}>
                Active Projects
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.875rem' }}>
                {activeProjects}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                projects in progress
              </Typography>
            </CardContent>
          </StatCard>
          
          <StatCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontWeight: 500 }}>
                Average Daily Hours
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.875rem' }}>
                {averageDailyHours.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>
                hours per day
              </Typography>
            </CardContent>
          </StatCard>
        </Box>
        {/* Projects Section */}
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem' }}>
                Project Breakdown
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, background: '#F3F4F6', borderRadius: 2, p: 0.5 }}>
                {(Object.keys(periodLabels) as TimePeriod[]).map((period) => (
                  <Button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    sx={{
                      textTransform: "none",
                      borderRadius: 1.5,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      px: 2.5,
                      py: 0.75,
                      minWidth: 'auto',
                      background: selectedPeriod === period ? '#FFFFFF' : 'transparent',
                      color: selectedPeriod === period ? '#2563EB' : '#6B7280',
                      boxShadow: selectedPeriod === period ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                      transition: "all 0.2s",
                      '&:hover': {
                        background: selectedPeriod === period ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                        color: selectedPeriod === period ? '#2563EB' : '#111827',
                      },
                    }}
                  >
                    {periodLabels[period]}
                  </Button>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {projects.map((project) => {
                const percentage = totalProductiveHours > 0
                  ? (project.productiveHours / totalProductiveHours) * 100
                  : 0;
                return (
                  <Box
                    key={project.projectId}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #E5E7EB',
                      background: '#FFFFFF',
                      transition: "all 0.2s ease",
                      '&:hover': {
                        borderColor: project.color,
                        boxShadow: `0 4px 12px ${project.color}20`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: project.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#111827',
                            fontSize: '1rem',
                          }}
                        >
                          {project.projectName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#111827',
                            fontSize: '1.25rem',
                          }}
                        >
                          {project.productiveHours.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                          hrs
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#F3F4F6",
                          '& .MuiLinearProgress-bar': {
                            background: project.color,
                            borderRadius: 4,
                            transition: "transform 0.4s ease",
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                        {percentage.toFixed(1)}% of total time
                      </Typography>
                      <Chip 
                        label={`${percentage.toFixed(0)}%`}
                        size="small"
                        sx={{
                          backgroundColor: `${project.color}15`,
                          color: project.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
            {projects.length === 0 && !isLoading && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 40, color: "#9CA3AF" }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, mb: 1 }}>
                  No Data Available
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  No productive hours recorded for this period
                </Typography>
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </Box>
    </GradientBackground>
  );
};

export default Dashboard;
