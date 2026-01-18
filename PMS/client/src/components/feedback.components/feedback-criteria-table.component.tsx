import { useState } from "react";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Collapse,
  type SxProps,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { theme } from "../../lib/theme";
import type { FeedbackCriteria } from "../../lib/types";
import type { Theme } from "@emotion/react";

export default function FeedbackCriteriaTable({
  sx,
  criteria,
  overrideToggleEnabled,
  onOverrideToggle,
}: {
  sx?: SxProps<Theme>;
  criteria: FeedbackCriteria[];
  overrideToggleEnabled: boolean;
  onOverrideToggle?: (id: number) => void;
}) {
  return (
    <Box sx={{ marginTop: "20px", overflowX: "auto", ...sx }}>
      <Table
        size="small"
        sx={{
          tableLayout: "fixed",
          border: `1px solid ${theme.borderSoft}`,
          borderRadius: "6px",
          "th, td": { fontSize: "0.95rem", paddingY: "12px" },
        }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8f8f8" }}>
            {/* Cell Reserved for Collapse Button */}
            <TableCell />

            <TableCell sx={{ fontWeight: 600, color: theme.textStrong, width: "35vw" }}>
              Criteria
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 600, color: theme.status.completed }}>
              Met
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 600, color: theme.status.missing }}>
              Unmet
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Override
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {criteria.map((c) => (
            <FeedbackCriteriaTable.Row
              key={c.feedbackCriteriaID}
              criterion={c}
              overrideToggleEnabled={overrideToggleEnabled}
              onOverrideToggle={onOverrideToggle}
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

FeedbackCriteriaTable.Row = ({
  criterion: c,
  overrideToggleEnabled,
  onOverrideToggle,
}: {
  criterion: FeedbackCriteria;
  overrideToggleEnabled: boolean;
  onOverrideToggle?: (id: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const hasObservation = Boolean(c.changeObserved);

  return (
    <>
      <TableRow>
        <TableCell>
          {hasObservation && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </TableCell>

        <TableCell
          sx={{
            fontWeight: c.status !== "met" ? 700 : 500,
            color:
              c.status === "met"
                ? theme.textStrong
                : c.status === "unmet"
                ? theme.status.missing
                : theme.link,
          }}>
          {c.description}
        </TableCell>

        <TableCell align="center">
          {c.status === "met" && <CheckIcon sx={{ color: theme.status.completed }} />}
        </TableCell>

        <TableCell align="center">
          {c.status === "unmet" && <CloseIcon sx={{ color: theme.status.missing }} />}
        </TableCell>

        <TableCell align="center">
          {overrideToggleEnabled &&
            (c.status === "unmet" || c.status === "overridden") &&
            onOverrideToggle && (
              <FeedbackCriteriaTable.OverrideToggleButton
                isToggled={c.status === "overridden"}
                onClick={() => onOverrideToggle(c.feedbackCriteriaID)}
              />
            )}
        </TableCell>
      </TableRow>

      {/* Collapsible Nested Row */}
      {open && (
        <TableRow>
          <TableCell
            sx={{
              paddingBottom: 0,
              paddingTop: 0,
            }}
            colSpan={5}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Typography
                variant="subtitle2"
                gutterBottom
                component="div"
                sx={{ color: theme.link }}>
                Change Observed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {c.changeObserved}
              </Typography>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

FeedbackCriteriaTable.OverrideToggleButton = ({
  isToggled,
  onClick,
}: {
  isToggled: boolean;
  onClick: () => void;
}) => (
  <IconButton size="small" onClick={onClick} sx={{ padding: 0 }}>
    {isToggled ? (
      <ToggleOn sx={{ fontSize: "1.6rem", color: theme.link }} />
    ) : (
      <ToggleOffIcon sx={{ fontSize: "1.6rem" }} />
    )}
  </IconButton>
);
