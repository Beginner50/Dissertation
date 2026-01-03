import React from "react";
import {
  Card,
  CardContent,
  MobileStepper,
  IconButton,
  Box,
  useTheme,
  Stack,
  type SxProps,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import type { ReactNode } from "react";

// 1. Root Container
export function SlidingActivityCard({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 500,
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}

// 2. Navigation Arrows (Explicit Props)
SlidingActivityCard.Arrows = ({
  activeStep,
  onBack,
  onNext,
}: {
  activeStep: number;
  onBack: () => void;
  onNext: () => void;
}) => (
  <>
    <IconButton
      onClick={onBack}
      disabled={activeStep === 0}
      sx={{
        position: "absolute",
        left: 8,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        bgcolor: "background.paper",
        boxShadow: 2,
        "&:hover": { bgcolor: "grey.100" },
        "&.Mui-disabled": { opacity: 0 },
      }}
    >
      <KeyboardArrowLeft />
    </IconButton>
    <IconButton
      onClick={onNext}
      disabled={activeStep === 1}
      sx={{
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        bgcolor: "background.paper",
        boxShadow: 2,
        "&:hover": { bgcolor: "grey.100" },
        "&.Mui-disabled": { opacity: 0 },
      }}
    >
      <KeyboardArrowRight />
    </IconButton>
  </>
);

// 3. The Slider Content (Explicit activeStep)
SlidingActivityCard.Content = ({
  activeStep,
  children,
}: {
  activeStep: number;
  children: ReactNode[]; // Expects [ReminderList, NotificationList]
}) => {
  const theme = useTheme();
  return (
    <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
      <Box
        sx={{
          display: "flex",
          transition: theme.transitions.create("transform", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          transform: `translateX(-${activeStep * 100}%)`,
        }}
      >
        {React.Children.map(children, (child) => (
          <Box sx={{ minWidth: "100%", flexShrink: 0 }}>{child}</Box>
        ))}
      </Box>
    </CardContent>
  );
};

// 4. Pagination Dots
SlidingActivityCard.Pagination = ({ activeStep }: { activeStep: number }) => (
  <MobileStepper
    variant="dots"
    steps={2}
    position="static"
    activeStep={activeStep}
    sx={{
      justifyContent: "center",
      bgcolor: "transparent",
      pb: 2,
      "& .MuiMobileStepper-dot": { width: 8, height: 8, mx: 0.5 },
      "& .MuiMobileStepper-dotActive": {
        bgcolor: "primary.main",
        transform: "scale(1.2)",
      },
    }}
    backButton={null}
    nextButton={null}
  />
);
