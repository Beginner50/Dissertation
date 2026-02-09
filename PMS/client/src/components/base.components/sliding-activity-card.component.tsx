import React from "react";
import {
  Card,
  CardContent,
  MobileStepper,
  IconButton,
  Box,
  useTheme,
  type SxProps,
  Badge,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import type { ReactNode } from "react";

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
        display: "flex",
        flexDirection: "column",
        width: "31vw",
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        ...sx,
      }}>
      {children}
    </Card>
  );
}

SlidingActivityCard.Content = ({
  activeStep,
  children,
}: {
  activeStep: number;
  children: ReactNode[];
}) => {
  const theme = useTheme();
  return (
    <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
      <Box
        sx={{
          display: "flex",
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.standard,
          }),
          transform: `translateX(-${activeStep * 100}%)`,
        }}>
        {React.Children.map(children, (child) => (
          <Box sx={{ minWidth: "100%", flexShrink: 0 }}>{child}</Box>
        ))}
      </Box>
    </CardContent>
  );
};

SlidingActivityCard.Navigation = ({
  activeStep,
  onNext,
  onBack,
  reminderCount,
}: {
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  reminderCount: number;
}) => (
  <MobileStepper
    variant="dots"
    steps={2}
    position="static"
    activeStep={activeStep}
    sx={{
      marginTop: "auto",
      justifyContent: "center",
      bgcolor: "transparent",
      pb: 2,
    }}
    nextButton={
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
          "&.Mui-disabled": { opacity: 0 },
        }}>
        <Badge color="success" badgeContent={reminderCount} invisible={activeStep == 1}>
          <KeyboardArrowRight />
        </Badge>
      </IconButton>
    }
    backButton={
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
          "&.Mui-disabled": { opacity: 0 },
        }}>
        <KeyboardArrowLeft />
      </IconButton>
    }
  />
);
