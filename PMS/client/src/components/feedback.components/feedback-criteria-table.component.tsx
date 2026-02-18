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
  Tooltip,
  MenuItem,
  ListItemIcon,
  Divider,
  Stack,
} from "@mui/material";
import {
  Check,
  Close,
  KeyboardArrowDown,
  KeyboardArrowUp,
  InfoOutlined,
  Edit,
  Delete,
  ToggleOn,
  ToggleOff,
} from "@mui/icons-material";
import { theme } from "../../lib/theme";
import type { FeedbackCriterion, User } from "../../lib/types";
import type { Theme } from "@emotion/react";
import MenuButton from "../base.components/menu-button.component";

export default function FeedbackCriteriaTable({
  sx,
  criteria,
  role,
  handleOverrideCriterion,
  handleEditCriterionClick,
  handleDeleteCriterion,
}: {
  sx?: SxProps<Theme>;
  criteria: FeedbackCriterion[];
  role: "student" | "supervisor" | "admin";
  handleOverrideCriterion: (c: FeedbackCriterion, action: "override" | "restore") => void;
  handleEditCriterionClick: (c: FeedbackCriterion) => void;
  handleDeleteCriterion: (c: FeedbackCriterion) => void;
}) {
  return (
    <Box sx={{ marginTop: "0px", overflowX: "auto", ...sx }}>
      <Table
        size="small"
        sx={{
          tableLayout: "fixed",
          border: `1px solid ${theme.borderSoft}`,
          borderTop: "none",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderRadius: "6px",
          "th, td": { fontSize: "0.95rem", paddingY: "12px" },
          ".MuiTableHead-root .MuiTableRow-root": {
            backgroundColor: "#fcfcfc",
          },
        }}>
        <FeedbackCriteriaTable.Header />
        <TableBody>
          {criteria.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                <Box sx={{ opacity: 0.3, mb: 1 }}>
                  <InfoOutlined fontSize="large" />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}>
                  No feedback criteria have been added to this task yet.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            criteria.map((c) => (
              <FeedbackCriteriaTable.Row
                key={c.feedbackCriterionID}
                criterion={c}
                role={role}
                handleOverrideToggle={() =>
                  handleOverrideCriterion(
                    c,
                    c.status === "overridden" ? "restore" : "override",
                  )
                }
                handleEditCriterion={() => handleEditCriterionClick(c)}
                handleDeleteCriterion={() => handleDeleteCriterion(c)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

FeedbackCriteriaTable.Header = () => (
  <TableHead>
    <TableRow sx={{ backgroundColor: "#f8f8f8" }}>
      <TableCell sx={{ width: "2vw" }} />
      <TableCell sx={{ fontWeight: 600, color: theme.textStrong }}>Criteria</TableCell>
      <TableCell
        align="center"
        sx={{ fontWeight: 600, color: theme.status.completed, width: "5vw" }}>
        Met
      </TableCell>
      <TableCell
        align="center"
        sx={{ fontWeight: 600, color: theme.status.missing, width: "5vw" }}>
        Unmet
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 600, color: theme.link, width: "6vw" }}>
        Overridden
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 600, width: "6vw" }}>
        Actions
      </TableCell>
    </TableRow>
  </TableHead>
);

FeedbackCriteriaTable.Row = ({
  criterion: c,
  role,
  handleOverrideToggle,
  handleEditCriterion,
  handleDeleteCriterion,
}: {
  criterion: FeedbackCriterion;
  role: User["role"];
  handleOverrideToggle: () => void;
  handleEditCriterion: () => void;
  handleDeleteCriterion: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const hasObservation = Boolean(c.changeObserved);

  return (
    <>
      <TableRow
        hover
        sx={{
          backgroundColor: c.status === "met" ? "rgba(76, 175, 80, 0.02)" : "inherit",
          borderBottom: "unset",
        }}>
        <TableCell>
          {hasObservation ? (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          ) : (
            <Tooltip title="No AI analysis available" arrow>
              <IconButton size="small" sx={{ color: "text.disabled" }}>
                <InfoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>

        <TableCell
          sx={{
            fontWeight: c.status === "unmet" ? 700 : 500,
            color: c.status === "unmet" ? theme.status.missing : theme.textStrong,
          }}>
          {c.description}
        </TableCell>

        {/* Met Column */}
        <TableCell align="center">
          {c.status === "met" && <Check sx={{ color: theme.status.completed }} />}
        </TableCell>

        {/* Unmet Column */}
        <TableCell align="center">
          {c.status === "unmet" && <Close sx={{ color: theme.status.missing }} />}
        </TableCell>

        {/* Overridden Column */}
        <TableCell align="center">
          {c.status === "overridden" && <Check sx={{ color: theme.link }} />}
        </TableCell>

        <TableCell align="right">
          {((role == "student" && c.status != "met") || role == "supervisor") && (
            <FeedbackCriteriaTable.MenuButton
              role={role}
              criterion={c}
              onOverrideButtonClick={handleOverrideToggle}
              onEditButtonClick={handleEditCriterion}
              onDeleteButtonClick={handleDeleteCriterion}
            />
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={6}
          style={{ paddingTop: 0, paddingBottom: 0, border: "none" }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                py: 2,
                px: 7,
                bgcolor: "#fafafa",
                borderBottom: `1px solid ${theme.borderSoft}`,
              }}>
              <Typography variant="subtitle2" sx={{ color: theme.link, fontWeight: 700 }}>
                AI Observation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {c.changeObserved}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

FeedbackCriteriaTable.MenuButton = ({
  criterion,
  role,
  onOverrideButtonClick,
  onEditButtonClick,
  onDeleteButtonClick,
}: {
  criterion: FeedbackCriterion;
  role: User["role"];
  onOverrideButtonClick: () => void;
  onEditButtonClick: () => void;
  onDeleteButtonClick: () => void;
}) => (
  <MenuButton>
    {/* Student Actions */}
    {role === "student" &&
      (criterion.status === "unmet" || criterion.status === "overridden") && (
        <MenuItem onClick={onOverrideButtonClick}>
          <ListItemIcon>
            {criterion.status === "overridden" ? (
              <ToggleOn color="primary" />
            ) : (
              <ToggleOff />
            )}
          </ListItemIcon>
          <Typography variant="body2">
            {criterion.status === "overridden" ? "Restore Override" : "Override Status"}
          </Typography>
        </MenuItem>
      )}

    {/* Supervisor Actions */}
    {role === "supervisor" && [
      <MenuItem onClick={onEditButtonClick} key={1}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2">Edit Criterion</Typography>
      </MenuItem>,
      <Divider key={2} />,
      <MenuItem onClick={onDeleteButtonClick} key={3}>
        <ListItemIcon>
          <Delete fontSize="small" color="error" />
        </ListItemIcon>
        <Typography variant="body2" color="error">
          Delete Criterion
        </Typography>
      </MenuItem>,
    ]}
  </MenuButton>
);
