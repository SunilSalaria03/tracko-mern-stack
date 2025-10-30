import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  ButtonGroup,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  FilterList as FilterListIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import type {
  TimePeriod,
  ProductiveHoursSummary,
} from "../../../utils/interfaces/dashboardInterface";
import { styled } from "@mui/material/styles";

const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
   padding: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: '0 4px 24px rgba(56, 112, 255, 0.12)',
  borderRadius: 20,
  border: '1px solid #F3F6FD',
  background: '#fff',
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#202D40',
  marginBottom: theme.spacing(2),
  letterSpacing: 0.3,
}));

const SoftDivider = styled('div')(({ theme }) => ({
  width: '100%',
  height: 1,
  background: '#E3EBFD',
  margin: `${theme.spacing(2)} 0`,
}));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today");

   const productiveHoursData: ProductiveHoursSummary = {
    today: [
      {
        projectId: "1",
        projectName: "E-Commerce Platform",
        productiveHours: 4.5,
        color: "#3B82F6",
      },
      {
        projectId: "2",
        projectName: "Mobile App Development",
        productiveHours: 3.2,
        color: "#10B981",
      },
      {
        projectId: "3",
        projectName: "CRM System",
        productiveHours: 2.8,
        color: "#F59E0B",
      },
    ],
    week: [
      {
        projectId: "1",
        projectName: "E-Commerce Platform",
        productiveHours: 28.5,
        color: "#3B82F6",
      },
      {
        projectId: "2",
        projectName: "Mobile App Development",
        productiveHours: 22.3,
        color: "#10B981",
      },
      {
        projectId: "3",
        projectName: "CRM System",
        productiveHours: 18.7,
        color: "#F59E0B",
      },
      {
        projectId: "4",
        projectName: "Data Analytics Dashboard",
        productiveHours: 15.2,
        color: "#8B5CF6",
      },
    ],
    month: [
      {
        projectId: "1",
        projectName: "E-Commerce Platform",
        productiveHours: 115.5,
        color: "#3B82F6",
      },
      {
        projectId: "2",
        projectName: "Mobile App Development",
        productiveHours: 98.8,
        color: "#10B981",
      },
      {
        projectId: "3",
        projectName: "CRM System",
        productiveHours: 87.3,
        color: "#F59E0B",
      },
      {
        projectId: "4",
        projectName: "Data Analytics Dashboard",
        productiveHours: 72.4,
        color: "#8B5CF6",
      },
      {
        projectId: "5",
        projectName: "API Gateway",
        productiveHours: 45.6,
        color: "#EC4899",
      },
    ],
    lastMonth: [
      {
        projectId: "1",
        projectName: "E-Commerce Platform",
        productiveHours: 105.2,
        color: "#3B82F6",
      },
      {
        projectId: "2",
        projectName: "Mobile App Development",
        productiveHours: 89.5,
        color: "#10B981",
      },
      {
        projectId: "3",
        projectName: "CRM System",
        productiveHours: 78.9,
        color: "#F59E0B",
      },
      {
        projectId: "4",
        projectName: "Data Analytics Dashboard",
        productiveHours: 65.3,
        color: "#8B5CF6",
      },
      {
        projectId: "5",
        projectName: "API Gateway",
        productiveHours: 52.1,
        color: "#EC4899",
      },
    ],
  };

  const currentProjects = productiveHoursData[selectedPeriod];

  const totalProductiveHours = useMemo(() => {
    return currentProjects.reduce(
      (sum, project) => sum + project.productiveHours,
      0
    );
  }, [currentProjects]);

  const periodLabels = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    lastMonth: "Last Month",
  };

  return (
    <GradientBackground>
      <Box maxWidth="880px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
          <SectionHeader variant="h4">
            <AccessTimeIcon sx={{ fontSize: 32, mb: -0.8, color: '#3569EF', mr: 1 }} />
            My Project Dashboard
          </SectionHeader>
          <Button
            variant="contained"
            startIcon={<TimerIcon />}
            onClick={() => navigate("/time")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(43, 98, 255, 0.08)',
              background: 'linear-gradient(90deg,#3569EF 0%,#7F56D9 100%)',
              color: '#fff',
              px: 3.5,
              py: 1.2,
              '&:hover': {
                background: 'linear-gradient(90deg,#2442B1 50%,#7C4BEE 100%)',
                boxShadow: '0 6px 18px rgba(67, 56, 202, 0.13)',
              },
            }}
          >
            Track Time
          </Button>
        </Box>
        <StyledCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <AccessTimeIcon sx={{ fontSize: 28, color: '#3569EF', mb: -0.7 }} />
                <Typography variant="h6" fontWeight={700} color="#202D40">
                  Projects Productive Hours
                </Typography>
              </Box>
              <ButtonGroup variant="contained" size="small" sx={{ boxShadow: '0 2px 6px rgba(43, 98, 255, 0.04)', borderRadius: 10 }}>
                {(Object.keys(periodLabels) as TimePeriod[]).map((period) => (
                  <Button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    variant={selectedPeriod === period ? "contained" : "outlined"}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      fontWeight: selectedPeriod === period ? 700 : 500,
                      background: selectedPeriod === period
                        ? 'linear-gradient(90deg,#3569EF 0%,#7F56D9 100%)'
                        : '#fff',
                      color: selectedPeriod === period ? '#fff' : '#3569EF',
                      borderColor: '#D2DBF8',
                      transition: "all .2s",
                      '&:hover': {
                        background: selectedPeriod === period
                          ? 'linear-gradient(90deg,#2442B1 0%,#7C4BEE 100%)'
                          : '#F5F7FB',
                        color: '#3569EF',
                      },
                    }}
                  >
                    {periodLabels[period]}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
            <SoftDivider />
            <Box
              sx={{
                background: "linear-gradient(90deg, #EAF2FF 0%, #F6EEFF 100%)",
                borderRadius: 3,
                p: 3,
                mb: 3,
                border: 1,
                borderColor: "#EFF4FC",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="body2" color="#6D7685" sx={{ mb: 0.5 }}>
                  Total Productive Hours ({periodLabels[selectedPeriod]})
                </Typography>
                <Typography variant="h2" fontWeight={800} color="#3569EF" sx={{ fontSize: '2.4rem' }}>
                  {totalProductiveHours.toFixed(1)} hrs
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" color="#6D7685" sx={{ mb: 0.5 }}>
                  Active Projects
                </Typography>
                <Typography variant="h2" fontWeight={800} color="#E94298" sx={{ fontSize: '2.4rem' }}>
                  {currentProjects.length}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {currentProjects.map((project) => {
                const percentage =
                  (project.productiveHours / totalProductiveHours) * 100;
                return (
                  <Card
                    key={project.projectId}
                    variant="outlined"
                    sx={{
                      p: 2.2,
                      borderRadius: 4,
                      border: '1.5px solid #E3EBF8',
                      transition: "box-shadow 0.3s, border 0.2s",
                      boxShadow: '0 2px 8px rgba(43, 98, 255, 0.07)',
                      background: '#FAFBFE',
                      '&:hover': {
                        border: '2px solid ' + project.color,
                        boxShadow: '0 8px 24px rgba(56, 112, 255, 0.13)',
                        background: '#F3F6FD',
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            backgroundColor: project.color,
                            boxShadow: '0 0 0 3px #fff, 0 2px 10px ' + project.color + '33',
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight={700} color="#222E45">
                          {project.projectName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="h5" fontWeight={700} color="#3569EF">
                          {project.productiveHours.toFixed(1)} hrs
                        </Typography>
                        <Typography variant="caption" color="#6D7685" fontWeight={600}>
                          {percentage.toFixed(1)}% of total
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 11,
                        borderRadius: 6,
                        backgroundColor: "#EFF3FB",
                        '& .MuiLinearProgress-bar': {
                          background: project.color,
                          borderRadius: 6,
                          transition: "transform 0.5s ease",
                        },
                      }}
                    />
                  </Card>
                );
              })}
            </Box>
            {currentProjects.length === 0 && (
              <Box sx={{ textAlign: "center", py: 7 }}>
                <AccessTimeIcon sx={{ fontSize: 72, color: "#D4DBED", mb: 2 }} />
                <Typography variant="h6" color="#8DA4C7" sx={{ mt: 2 }}>
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
