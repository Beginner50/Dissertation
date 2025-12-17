import type { Theme } from "@emotion/react";
import { Box, Divider, Typography, type SxProps } from "@mui/material";
import type { ReactNode } from "react";

export function ListHeader({ title, sx, children }: { title: string, sx?: SxProps<Theme> | undefined, children?: ReactNode }) {
    return (
        <>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                paddingBottom: '0.5rem',
                ...sx
            }}>
                <Typography variant="h2" sx={{
                    fontSize: '1.2rem',
                    fontFamily: "sans-serif",
                    fontWeight: 600,
                    color: "black",
                    margin: 0,
                    padding: "2px",
                    alignSelf: "end"
                }}>
                    {title}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    gap: '10px',
                }}>
                    {children}
                </Box>
            </Box>
            <Divider sx={{
                marginBottom: "0.7rem"
            }} />
        </>
    )
}