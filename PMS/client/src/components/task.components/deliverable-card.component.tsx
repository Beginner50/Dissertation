import { theme } from "../../lib/theme";
import type { Theme } from "@emotion/react";
import { Description, Download } from "@mui/icons-material";
import { Box, IconButton, Typography, type SxProps } from "@mui/material";

export default function DeliverableCard(
    { text, sx, deliverableFile: { fileName, uploadedAt, sizeLabel, url } }
        : {
            deliverableFile: { fileName: string, uploadedAt: string, sizeLabel: string, url: string }
            , sx?: SxProps<Theme> | undefined
            , text: string
        }) {
    return (
        <Box
            sx={{
                minWidth: '200px',
                p: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.borderSoft}`,
                backgroundColor: 'hsl(220, 13%, 97%)',
                flexShrink: 0,
                ...sx
            }}
        >
            <Typography
                component="h3"
                sx={{ fontSize: '0.9rem', fontWeight: 600, color: theme.textStrong, mb: 1 }}
            >
                {text}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                {/* File Icon */}
                <Description sx={{ color: theme.textNormal, fontSize: '1.8rem', flexShrink: 0 }} />

                {/* File Info */}
                <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Typography
                        title={fileName}
                        sx={{ fontSize: '0.85rem', fontWeight: 500, color: theme.textStrong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                        {fileName}
                    </Typography>
                    <Typography
                        sx={{ fontSize: '0.75rem', color: theme.textMuted }}
                    >
                        {uploadedAt} · {sizeLabel}
                    </Typography>
                </Box>

                {/* Download Icon Button */}
                <IconButton
                    size="small"
                    component="a"
                    href={url}
                    download={fileName}
                    title="Download Deliverable"
                    sx={{ flexShrink: 0, color: theme.textNormal }}
                >
                    <Download fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}