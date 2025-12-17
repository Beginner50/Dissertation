import type { Theme } from "@emotion/react";
import { Box, Button, Typography, type SxProps } from "@mui/material";
import { AddCircleOutline, GroupAdd } from "@mui/icons-material";
import type { ReactNode } from "react";
import type { Project } from "@/lib/types";
import { ListHeader } from "../base.components/list-header.component";
import { theme } from "@/lib/theme";
import InteractiveListEntry from "../base.components/list-entry-interactive.component";

export function ProjectList({ projectList, sx, children }: { projectList?: Project[], sx?: SxProps<Theme> | undefined, children?: ReactNode }) {
    const baseButtonSx = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid transparent',
        fontWeight: 600,
        fontSize: '0.95rem',
        textTransform: 'none',
        transition: 'background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s',
    };

    const primaryButtonSx = {
        ...baseButtonSx,
        backgroundColor: '#2563eb',
        color: '#ffffff',
        borderColor: '#2563eb',
        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
        '&:hover': {
            backgroundColor: '#1d4ed8',
            borderColor: '#1d4ed8',
            boxShadow: '0 4px 8px rgba(37, 99, 235, 0.4)', // Enhanced hover shadow
        }
    };

    const ghostButtonSx = {
        ...baseButtonSx,
        backgroundColor: 'transparent',
        color: '#2563eb',
        borderColor: '#2563eb',
        '&:hover': {
            backgroundColor: '#e0ebff', // Light blue hover background
            borderColor: '#2563eb',
            color: '#1d4ed8', // Slightly darker text on hover
        }
    };


    return (
        <Box sx={{
            padding: "1rem",
            display: 'flex',
            background: "white",
            borderRadius: "8px",
            borderColor: theme.borderSoft,
            borderStyle: "solid",
            borderWidth: "1px",
            boxShadow: theme.shadowSoft,
            ...sx
        }}>
            <ListHeader title="My Projects">
                <Button sx={primaryButtonSx} disableElevation>
                    <AddCircleOutline sx={{ fontSize: '1rem' }} />
                    Create Project
                </Button>
                <Button sx={ghostButtonSx} disableElevation>
                    <GroupAdd sx={{ fontSize: '1rem' }} />
                    Join Project
                </Button>
            </ListHeader>

            {/* Project Entries */}
            <Box sx={{
                overflowY: 'visible'
            }}>
                {projectList?.map(project => (
                    <InteractiveListEntry
                        key={project.id}
                        linkText={project.name}
                        linkURL={"/projects/$projectID/tasks"}
                        linkParams={{ projectID: project.id }}
                        subText={
                            <Typography component="span" sx={{
                                fontSize: '0.85rem',
                                color: theme.textMuted
                            }}>
                                Student: <strong>{project.student}</strong>
                            </Typography>
                        }
                    />
                ))}
            </Box>
        </Box>
    )
}