import { Box, Typography, Button, type SxProps, type Theme, Divider } from "@mui/material";
import { theme } from "@/lib/theme";
import type { ProjectDetailsData, Stakeholder } from "@/lib/types";

// --- Hardcoded Primary Colors (MUI Defaults) ---
const PRIMARY_MAIN_COLOR = '#1976d2';
const PRIMARY_DARK_COLOR = '#115293';

// --- Internal Stakeholder Component ---

interface StakeholderItemProps {
    role: string;
    name: string;
    id: string;
}

const StakeholderItem = ({ role, name, id }: StakeholderItemProps) => (
    <Box sx={{
        // Corresponds to .stakeholder-item
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9rem',
    }}>
        {/* Corresponds to .stakeholder-role */}
        <Typography component="span" sx={{
            fontWeight: 600,
            color: '#333',
            minWidth: '100px',
            marginRight: '1rem',
        }}>
            {role}:
        </Typography>

        {/* Corresponds to .stakeholder-name */}
        <Typography component="span" sx={{
            fontWeight: 400,
            color: '#1f2937',
            flexGrow: 1,
            marginRight: '1rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }}>
            {name}
        </Typography>

        {/* Corresponds to .stakeholder-id */}
        <Typography component="span" sx={{
            textAlign: 'right',
            fontFamily: 'monospace',
            color: '#4b5563',
            minWidth: '60px',
        }}>
            {id}
        </Typography>
    </Box>
);


interface ProjectDetailsProps {
    data: ProjectDetailsData;
    sx?: SxProps<Theme> | undefined;
}

export function ProjectDetails({ data, sx }: ProjectDetailsProps) {
    const {
        projectId,
        projectTitle,
        projectDescription,
        student,
        supervisor
    } = data;

    const projectLabel = projectId != null ? `Project ${projectId}` : "Project";
    const title = projectTitle ?? projectLabel;
    const description = projectDescription ?? "No description provided.";
    const isStudentAssigned = !!student.id && student.name !== 'Unassigned';


    return (
        <Box sx={{
            // Corresponds to .project-summary styles
            background: `rgba(255, 255, 255, 0.73)`,
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${theme.borderSoft || '#e5e7eb'}`,
            boxShadow: theme.shadowMuted || '0 4px 12px rgba(17, 24, 39, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            ...sx
        }}>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                flexGrow: 1,
            }}>

                <Typography variant="h3" component="h3" sx={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: 0,
                    lineHeight: 1.2,
                }}>
                    {title}
                </Typography>


                <Typography component="p" sx={{
                    margin: 0,
                    color: '#4b5563',
                    lineHeight: 1.5,
                    fontSize: '0.95rem',
                }}>
                    {description}
                </Typography>

                <Box sx={{
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px dashed #eee',
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '5px',
                }}>
                    <StakeholderItem
                        role={student.role}
                        name={student.name}
                        id={student.id}
                    />
                    <StakeholderItem
                        role={supervisor.role}
                        name={supervisor.name}
                        id={supervisor.id}
                    />
                </Box>

                <Divider />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    paddingBottom: '10px',
                    borderBottom: `1px solid ${theme.borderSoft || '#eee'}`,
                }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => console.log('Generate Report')}
                        sx={{
                            backgroundColor: PRIMARY_MAIN_COLOR,
                            '&:hover': { backgroundColor: PRIMARY_DARK_COLOR },
                            textTransform: 'none',
                            width: '100%',
                            maxWidth: '300px',
                            padding: '6px 12px',
                        }}
                    >
                        Generate Progress Log Report
                    </Button>

                    <Button
                        variant="outlined"
                        size="small"
                        disabled={isStudentAssigned}
                        onClick={() => console.log('Add Student')}
                        sx={{
                            color: PRIMARY_MAIN_COLOR,
                            borderColor: PRIMARY_MAIN_COLOR,
                            '&:hover': { borderColor: PRIMARY_DARK_COLOR },
                            textTransform: 'none',
                            width: '100%',
                            maxWidth: '300px',
                            padding: '6px 12px',
                        }}
                    >
                        Add Student
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}