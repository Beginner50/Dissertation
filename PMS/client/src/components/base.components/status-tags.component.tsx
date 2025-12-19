import { theme } from "../../lib/theme";
import { CheckCircleOutline, ErrorOutline, HourglassEmpty } from "@mui/icons-material";
import { Box } from "@mui/material";

export function CompletedVariant1() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem 0.3rem 0.2rem 0.2rem',
                gap: "2px",
                borderRadius: '999px',
                backgroundColor: 'hsla(220, 13%, 95%, 0.9)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: theme.textMuted,
                width: "7.9vw",
            }}
        >
            <CheckCircleOutline sx={{ color: theme.status.completed, fontSize: '1.4rem' }} />
            Completed
        </Box>
    );
}

export function MissingVariant1() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem 0.3rem 0.2rem 0.2rem',
                gap: "2px",
                borderRadius: '999px',
                backgroundColor: 'hsla(220, 13%, 95%, 0.9)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: theme.textMuted,
                width: "7.9vw",
            }}
        >
            <ErrorOutline sx={{ color: theme.status.missing, fontSize: '1.4rem' }} />
            Missing
        </Box>
    );
}

export function PendingVariant1() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem 0.3rem 0.2rem 0.2rem',
                gap: "2px",
                borderRadius: '999px',
                backgroundColor: 'hsla(220, 13%, 95%, 0.9)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: theme.textMuted,
                width: "7.9vw",
            }}
        >
            <HourglassEmpty sx={{ color: theme.status.pending, fontSize: '1.4rem' }} />
            Pending
        </Box>
    );
}

export function CompletedVariant2() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: theme.status.completed,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
            }}
        >
            COMPLETED
        </Box>
    );
}

export function MissingVariant2() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: theme.status.missing,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
            }}
        >
            MISSING
        </Box>
    );
}

export function PendingVariant2() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: theme.status.pending,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
            }}
        >
            PENDING
        </Box>
    );
}