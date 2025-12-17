import { theme } from "@/lib/theme";
import type { FeedbackCriteria } from "@/lib/types";
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, type SxProps } from "@mui/material";

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import type { Theme } from "@emotion/react";
import { ToggleOn } from "@mui/icons-material";

function OverrideToggleButton({ isToggled, onClick }:
    { isToggled: boolean, onClick: () => void }) {
    return (
        <IconButton
            size="small"
            onClick={onClick}
            sx={{ padding: 0 }}
        >
            {isToggled ?
                <ToggleOn sx={{ fontSize: '1.6rem', color: theme.link, }} />
                : <ToggleOffIcon sx={{ fontSize: '1.6rem', }} />}
        </IconButton>
    )
}
export default function FeedbackCriteriaTable({
    sx,
    criteria,
    onOverrideToggle,
}: {
    sx?: SxProps<Theme> | undefined,
    criteria: FeedbackCriteria[],
    onOverrideToggle?: (id: number) => void
}) {
    return (
        <Box sx={{ marginTop: '20px', overflowX: 'auto', ...sx }}>
            <Table
                size="small"
                sx={{
                    border: `1px solid ${theme.borderSoft}`,
                    borderRadius: '6px',
                    overflowY: 'auto',
                    'th': {
                        fontSize: '0.95rem',
                        paddingY: '12px',
                    },
                    'td': {
                        fontSize: '0.95rem',
                        paddingY: '12px',
                    },
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell sx={{
                            fontWeight: 600,
                            backgroundColor: '#f8f8f8',
                            borderBottom: `2px solid ${theme.borderSoft}`,
                            padding: '10px 8px',
                            color: theme.textStrong,
                        }}>Criteria</TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                backgroundColor: '#f8f8f8',
                                borderBottom: `2px solid ${theme.borderSoft}`,
                                padding: '10px 8px',
                                color: theme.status.completed,
                            }} > Met</TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                backgroundColor: '#f8f8f8',
                                borderBottom: `2px solid ${theme.borderSoft}`,
                                padding: '10px 8px',
                                color: theme.status.missing,
                            }} >Unmet</TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                backgroundColor: '#f8f8f8',
                                borderBottom: `2px solid ${theme.borderSoft}`,
                                padding: '10px 8px',
                            }} >Override</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {criteria.map(c => (
                        <TableRow key={c.id}>
                            {/* Criteria Description */}
                            <TableCell sx={{
                                borderBottom: `1px solid ${theme.borderSoft}`,
                                fontWeight: c.status !== "met" ? 700 : 500,
                                fontSize: '1rem',
                                color: c.status === "met" ? theme.textStrong
                                    : c.status === "unmet" ? theme.status.missing
                                        : theme.link,
                            }}>
                                {c.text}
                            </TableCell>

                            {/* Met Status */}
                            <TableCell sx={{
                                textAlign: 'center',
                                padding: '12px',
                                width: '64px',
                            }}>
                                {c.status === "met" && (
                                    <CheckIcon
                                        sx={{
                                            color: theme.status.completed,
                                            fontSize: '1.4rem',
                                        }}
                                    />
                                )}
                            </TableCell>

                            {/* Unmet Status */}
                            <TableCell sx={{
                                textAlign: 'center',
                                padding: '12px',
                                width: '64px',
                            }}>
                                {c.status === "unmet" && (
                                    <CloseIcon
                                        sx={{
                                            color: theme.status.missing,
                                            fontSize: '1.6rem',
                                        }}
                                    />
                                )}
                            </TableCell>

                            {/* Override Status */}
                            <TableCell sx={{
                                textAlign: 'center',
                                padding: '12px',
                                width: '64px',
                            }}>
                                {(c.status === "unmet" || c.status === "overridden") && onOverrideToggle &&
                                    <OverrideToggleButton isToggled={c.status == "overridden"} onClick={
                                        () => onOverrideToggle(c.id)
                                    } />
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box >
    );
};
