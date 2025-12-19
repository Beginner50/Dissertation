import { type ReactNode } from "react";
import { theme } from "../../lib/theme";
import { Box, Typography, type SxProps, IconButton } from "@mui/material";
import type { Theme } from "@emotion/react";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";


export function TaskDetails({ sx, children }:
    { sx?: SxProps<Theme> | undefined, children?: ReactNode }) {

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
            {children}
        </Box>
    );
}


TaskDetails.Header = ({ title, deadline }: { title: string, deadline: string }) => {
    return (
        < Box sx={{
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${theme.borderSoft}`
        }
        }>
            <Typography
                variant="h1"
                component="h1"
                sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.textStrong }}
            >
                {title}
            </Typography>
            <Typography
                component="p"
                sx={{ fontSize: '0.9rem', color: theme.textMuted, marginTop: '4px' }}
            >
                Deadline: <Box component="strong" sx={{ color: theme.textStrong }}>{deadline}</Box>
            </Typography>
        </Box >
    )
}

TaskDetails.Body = ({ children }: { children?: ReactNode }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '20px',
                marginBottom: '20px',
                // Allow wrapping on very small screens, stacking vertically
                flexDirection: { xs: 'column', sm: 'row' }
            }}
        >
            {children}
        </Box>
    )
}

TaskDetails.Description = ({ children: description }: { children: ReactNode }) => {
    return (
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
                component="p"
                sx={{ color: theme.textNormal, lineHeight: 1.6 }}
            >
                {description}
            </Typography>
        </Box>
    )
}
