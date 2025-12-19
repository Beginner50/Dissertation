import { theme } from "../../lib/theme";
import type { Reminder } from "../../lib/types";
import { Box, Typography } from "@mui/material";

function getStatusColor(status: Reminder["status"], type: "text" | "background") {
    switch (type) {
        case "background":
            switch (status) {
                case "completed":
                    return "hsl(0,0%,100%)";
                case "missing":
                    return "hsl(0,0%,100%)";
                case "pending":
                    return "#fff8e1";
            }
        case "text":
            switch (status) {
                case "completed":
                    return theme.status.completed
                case "missing":
                    return theme.status.missing
                case "pending":
                    return theme.status.pending
            }
    }
}

export default function ReminderEntry({ reminder }: { reminder: Reminder }) {
    const { status, readStatus } = reminder;

    return (
        <Box
            sx={{
                padding: '6px 8px 6px 10px',
                marginBottom: '6px',
                borderRadius: '4px',
                border: '1px solid transparent',
                transition: 'all 0.2s ease-in-out',
                opacity: (readStatus === "read" && status !== "pending") ? 0.55 : 1,
                background:
                    readStatus === "unread" || status === "pending"
                        ? getStatusColor(status, "background")
                        : "#f3f3f3",
                borderWidth: "0px",
                borderLeft: "3px",
                borderStyle: "solid",
                borderColor:
                    readStatus === "unread" || status === "pending" || status == "missing" ?
                        getStatusColor(status, "text")
                        : theme.textMuted,
                boxShadow: readStatus === "unread" ?
                    '0 1px 4px rgba(0, 0, 0, 0.08)' :
                    "none"
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    marginBottom: '2px',
                    color: theme.textMuted,
                    textDecoration: (status === 'completed' ? 'none' : 'inherit'),
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Status Flair */}
                    {(status === "missing" || status === "pending") && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: getStatusColor(status, "text"),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                            }}
                        >
                            {status.toUpperCase()}
                        </Box>
                    )}
                    {/* Reminder Date */}
                    <Typography component="span" sx={{
                        fontSize: 'inherit',
                        color: 'inherit',
                        textDecoration: 'inherit',
                    }}>
                        {reminder.date}
                    </Typography>
                </Box>

                {/* Reminder Time */}
                <Typography component="span" sx={{
                    fontSize: 'inherit',
                    fontWeight: 600,
                    color: 'inherit',
                    textDecoration: 'inherit',
                }}>
                    {reminder.time}
                </Typography>
            </Box>

            {/* Reminder Description */}
            <Typography component="p" sx={{
                margin: 0,
                fontSize: '0.85rem',
                color: readStatus === "unread" || status === "pending" ? theme.textStrong
                    : theme.textMuted,
                textDecoration: (status === 'completed' ? 'none' : 'inherit'),
            }}>
                {reminder.description}
            </Typography>
        </Box>
    );
}