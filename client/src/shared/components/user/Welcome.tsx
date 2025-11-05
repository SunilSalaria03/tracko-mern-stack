import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import {
  AccessTime,
  AccountCircle,
  Timer,
  PhoneIphone,
  Schedule,
  LocalCafe,
  FormatQuote,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors";
import { useMemo } from "react";
import { getEventWish } from "../../../utils/common/helpers";
import { quotes } from "../../../utils/constants/constants";

const Welcome = () => {
  const theme = useTheme();
  const auth = useSelector(selectAuth);
  const userName = auth?.user?.name || "User";

  const dailyQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, []);

  const eventWish = useMemo(() => getEventWish(), []);

  const onboardingSteps = [
    {
      icon: <AccessTime />,
      text: "Learn the basics of time tracking",
    },
    {
      icon: <AccountCircle />,
      text: "Upload your profile picture",
    },
    {
      icon: <Timer />,
      text: "Track your first hour",
    },
    {
      icon: <PhoneIphone />,
      text: "Get the desktop and mobile apps",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.grey[50],
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 8 }}
          alignItems="flex-start"
        >
          {/* Left Content */}
          <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: 600 } }}>
            <Stack spacing={4}>
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 3 }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: theme.typography.fontWeightRegular,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Welcome to Tracko, {userName}!
                  </Typography>
                  <Link
                    href="#"
                    underline="hover"
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: "0.875rem",
                      fontWeight: theme.typography.fontWeightMedium,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Hide this page
                  </Link>
                </Stack>

                {/* Event Wish */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    p: 2.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: theme.typography.fontWeightMedium,
                      textAlign: "center",
                    }}
                  >
                    {eventWish}
                  </Typography>
                </Paper>

                {/* Daily Quote */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    borderRadius: theme.shape.borderRadius,
                    p: 3,
                    mb: 3,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <FormatQuote
                      sx={{
                        fontSize: 40,
                        color: alpha(theme.palette.secondary.main, 0.3),
                        transform: "rotate(180deg)",
                        mt: -1,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.primary,
                          fontStyle: "italic",
                          mb: 1.5,
                          lineHeight: 1.6,
                        }}
                      >
                        {dailyQuote.text}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: theme.typography.fontWeightMedium,
                          textAlign: "right",
                        }}
                      >
                        — {dailyQuote.author}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: theme.typography.fontWeightRegular,
                    mb: 3,
                  }}
                >
                  Here's how to get started:
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                  }}
                >
                  <List sx={{ py: 0 }}>
                    {onboardingSteps.map((step, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          py: 2.5,
                          px: 3,
                          borderBottom:
                            index < onboardingSteps.length - 1
                              ? `1px solid ${theme.palette.divider}`
                              : "none",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.action.hover, 0.04),
                            cursor: "pointer",
                          },
                          transition: theme.transitions.create(
                            ["background-color"],
                            {
                              duration: theme.transitions.duration.short,
                            }
                          ),
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 48,
                            color: theme.palette.text.secondary,
                            "& .MuiSvgIcon-root": {
                              fontSize: 28,
                            },
                          }}
                        >
                          {step.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={step.text}
                          primaryTypographyProps={{
                            variant: "body1",
                            sx: {
                              color: theme.palette.text.primary,
                              fontWeight: theme.typography.fontWeightRegular,
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                <Box sx={{ mt: 3, ml: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        sx={{
                          color: "#ff6633",
                          "&.Mui-checked": {
                            color: "#ff6633",
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Email me occasional updates, offers, tips, and
                        interesting stories
                      </Typography>
                    }
                  />
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Right Illustration */}
          <Box
            sx={{
              flex: "0 0 auto",
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              pt: 8,
            }}
          >
            <Stack spacing={4} alignItems="center">
              <Box
                sx={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Schedule
                  sx={{
                    fontSize: 72,
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
              <Box
                sx={{
                  position: "relative",
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalCafe
                  sx={{
                    fontSize: 60,
                    color: theme.palette.secondary.main,
                  }}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Welcome;
