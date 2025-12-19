import type { Theme } from "@emotion/react";
import { Box, type SxProps } from "@mui/material";
import { ListHeader } from "../base.components/list-header.component";
import { theme } from "../../lib/theme";
import type { Reminder } from "../../lib/types";
import ReminderEntry from "./reminder-entry.component";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

function getReminders() {
    const mockReminders: Reminder[] = [
        { id: 10, date: "Dec 20, 2025", time: "09:00 AM", description: "John Doe: Progress Log Report Due", status: 'pending', readStatus: "read" },
        { id: 11, date: "Dec 18, 2025", time: "02:30 PM", description: "Review Project Scope Document V2", status: 'pending', readStatus: "unread" },
        { id: 31, date: "Dec 15, 2025", time: "10:00 AM", description: "Deliverable Submitted and Acknowledged", status: 'completed', readStatus: "unread" },
        { id: 21, date: "Dec 14, 2025", time: "04:00 PM", description: "Server Migration Log Overdue", status: 'missing', readStatus: "unread" },
        { id: 20, date: "Dec 10, 2025", time: "11:00 AM", description: "Client Feedback Deadline Missed", status: 'missing', readStatus: "read" },
        { id: 30, date: "Nov 28, 2025", time: "1:00 PM", description: "Added John Doe to Project PMS Dissertation", status: 'completed', readStatus: "read" },
    ];
    return mockReminders;
}

function useLiveStreamUpdates(
    currentReminders: Reminder[] | undefined,
    setReminders: React.Dispatch<React.SetStateAction<Reminder[] | undefined>>
) {
    useEffect(() => {
        // const stream = connectToStream(); // Placeholder function
        // stream.onNewReminder((newReminder) => {
        //     if (currentReminders) {
        //         // Prepend new reminder and set state, which triggers the timer to reset
        //         setReminders([newReminder, ...currentReminders]);
        //     }
        // });
        // return () => stream.close();
    }, [currentReminders, setReminders]);
}

export function ReminderList({ sx }: { sx?: SxProps<Theme> | undefined }) {
    const { data } = useQuery({
        queryKey: ["reminders"],
        queryFn: getReminders,
        staleTime: Infinity
    })
    const [reminders, setReminders] = useState<Reminder[] | undefined>(data);
    useLiveStreamUpdates(reminders, setReminders);

    // Update the state once data updates
    useEffect(() => {
        setReminders(data);
    }, [data]);

    return (
        <Box sx={{
            padding: '1rem',
            background: "white",
            borderRadius: '8px',
            overflowY: 'auto',
            border: `1px solid ${theme.borderSoft}`,
            boxShadow: theme.shadowSoft,
            ...sx,
        }}>
            <ListHeader title="Reminders" />

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
            }}>
                {reminders?.map(reminder => (
                    <ReminderEntry key={reminder.id} reminder={reminder} />
                ))}
            </Box>
        </Box>
    );
} 