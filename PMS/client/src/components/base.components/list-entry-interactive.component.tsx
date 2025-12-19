import { theme } from "../../lib/theme";
import type { Theme } from "@emotion/react";
import { MoreVert } from "@mui/icons-material";
import { Box, IconButton, Typography, type SxProps } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router";

export default function InteractiveListEntry({
    sx,
    icon,
    linkText,
    linkURL,
    subText,
}: {
    sx?: SxProps<Theme> | undefined,
    icon?: ReactNode
    linkText: string,
    linkURL: string,
    subText?: ReactNode
}) {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: "row",
            alignItems: 'center',
            padding: '10px 12px',
            marginBottom: '8px',
            background: "hsl(0,0%,99.5%)",
            borderRadius: '8px',
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: theme.borderNormal,
            boxShadow: theme.shadowMuted,
            transition: 'box-shadow 0.2s, border-color 0.2s, opacity 0.3s, transform 0.1s',
            gap: '14px',

            '&:hover': {
                borderColor: theme.borderNormal,
                boxShadow: theme.shadowSoft,
            },
            ...sx
        }}>
            {icon}

            <Box sx={{
                flexGrow: 1,
                marginRight: "auto",
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Link to={linkURL}
                    style={{ textDecoration: 'none' }} >
                    <Typography component="span" sx={{
                        textDecoration: 'none',
                        color: theme.link,
                        fontWeight: 600,
                        fontSize: '1rem',
                        transition: 'color 0.2s',
                        '&:hover': {
                            color: theme.linkFocused,
                            textDecoration: 'underline',
                        }
                    }}>
                        {linkText}
                    </Typography>
                </Link>

                {subText}
            </Box>

            <IconButton >
                <MoreVert fontSize="inherit" />
            </IconButton>
        </Box>
    );
}