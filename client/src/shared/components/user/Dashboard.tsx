import React, { useState, useMemo } from "react";
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
} from "@mui/icons-material";
import type {
  TimePeriod,
  ProductiveHoursSummary,
} from "../../../utils/interfaces/dashboardInterface";

const Dashboard: React.FC = () => {
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
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            sx={{ textTransform: "none" }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
          >
            All Time Activity
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
          >
            All Projects
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 28, color: "primary.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Projects Productive Hours
              </Typography>
            </Box>
            <ButtonGroup variant="contained" size="small">
              {(Object.keys(periodLabels) as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  variant={selectedPeriod === period ? "contained" : "outlined"}
                  sx={{
                    textTransform: "none",
                    fontWeight: selectedPeriod === period ? 600 : 500,
                  }}
                >
                  {periodLabels[period]}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          <Box
            sx={{
              background: "linear-gradient(to right, #E3F2FD, #E8EAF6)",
              borderRadius: 2,
              p: 2,
              mb: 3,
              border: 1,
              borderColor: "primary.light",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Productive Hours ({periodLabels[selectedPeriod]})
                </Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {totalProductiveHours.toFixed(1)} hrs
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Active Projects
                </Typography>
                <Typography variant="h3" fontWeight={700} color="secondary.main">
                  {currentProjects.length}
                </Typography>
              </Box>
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
                    p: 2,
                    transition: "box-shadow 0.3s",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          backgroundColor: project.color,
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {project.projectName}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="h5" fontWeight={700}>
                        {project.productiveHours.toFixed(1)} hrs
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {percentage.toFixed(1)}% of total
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: project.color,
                        borderRadius: 5,
                        transition: "transform 0.5s ease",
                      },
                    }}
                  />
                </Card>
              );
            })}
          </Box>

          {currentProjects.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <AccessTimeIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No productive hours recorded for this period
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
