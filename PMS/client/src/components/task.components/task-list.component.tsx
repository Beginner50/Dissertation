import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import { ListHeader } from "../base.components/list-header.component";
import { theme } from "@/lib/theme";

import type { Task } from "@/lib/types";
import InteractiveListEntry from "../base.components/list-entry-interactive.component";
import { CompletedVariant1, MissingVariant1, PendingVariant1 } from "../base.components/status-tags.component";

const mockTasks: Task[] = [
    {
        id: 501, title: "Finalize Component Architecture", status: 'pending', deadline: "2026-01-15", projectId: 101,
    },
    {
        id: 503, title: "Review Security Audit Report", status: 'completed', deadline: "2025-12-05", projectId: 101,
    },
    {
        id: 504, title: "Implement UI/UX Feedback Loop", status: 'missing', deadline: "2025-01-20", projectId: 101,
    },
    {
        id: 502, title: "Set up CI/CD Pipeline", status: 'completed', deadline: "2025-12-05", projectId: 101,
    },
];


export function TaskList({ sx }: { sx?: SxProps<Theme> | undefined }) {
    return (
        <Box sx={{
            padding: "1rem",
            display: 'flex',
            flexDirection: 'column',
            background: "white",
            borderColor: theme.borderSoft,
            borderRadius: "8px",
            borderStyle: "solid",
            borderWidth: "1px",
            boxShadow: theme.shadowSoft,
            ...sx
        }}>
            <ListHeader
                title="Project Tasks"
            ></ListHeader>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
            }}>
                {mockTasks.map(task => {
                    const deadlineDate = new Date(task.deadline);
                    const isDeadlinePast = !Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < Date.now();

                    return (<InteractiveListEntry
                        key={task.id}
                        icon={
                            task.status === "completed" ? <CompletedVariant1 />
                                : task.status === "missing" ? <MissingVariant1 />
                                    : <PendingVariant1 />}
                        linkText={task.title}
                        linkURL={"/projects/$projectID/tasks/$taskID"} linkParams={{
                            projectID: task.projectId,
                            taskID: task.id
                        }}
                        subText={
                            <Typography component="span" sx={{
                                fontSize: '0.85rem',
                                color: theme.textNormal,
                                textDecoration: isDeadlinePast ? 'line-through' : 'none',
                            }}>
                                Deadline: {isDeadlinePast
                                    ? task.deadline
                                    : <strong style={{ fontWeight: 600 }}>{task.deadline}</strong>
                                }
                            </Typography>
                        }
                    />);
                })}
            </Box>
        </Box>
    );
}