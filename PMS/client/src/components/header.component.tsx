import { Link, useLocation } from "@tanstack/react-router";
import { Box, Button, Typography } from "@mui/material"
import { theme } from "@/lib/theme";

export default function Header({ showNavlinks = false }: { showNavlinks?: boolean }) {
    const location = useLocation();

    return (
        <header style={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: "white",
            borderBottom: `1px solid ${theme.borderSoft}`,
            boxShadow: theme.shadowMuted,
            marginBottom: 0,
            width: "100vw"
        }}>
            <Link to="/projects" style={{
                textDecoration: "none",
                color: "black",
                fontSize: "1.2rem",
                fontWeight: 600,
                padding: "10px",
                display: "inline-block"
            }}>
                Project Management System
            </Link>
            <Box sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "row",
                marginLeft: "4rem",
            }}>
                {showNavlinks && (
                    <nav style={{ display: "flex", columnGap: "0.9rem", alignItems: "center" }}>
                        <Link to="/projects">
                            <Typography sx={{
                                color: theme.textMuted,
                                ":hover": {
                                    ...(!location.pathname.includes("project") && { color: theme.textNormal }),
                                    borderBottom: "3px",
                                    borderRadius: "0.2rem",
                                    borderStyle: "solid",
                                    borderColor: "hsla(251, 100%, 50%, 0.52)"
                                },
                                ...(location.pathname.includes("projects") && { color: theme.textStrong })
                            }}>
                                Projects
                            </Typography>
                        </Link>
                        <Link to="/scheduler" >
                            <Typography sx={{
                                color: theme.textMuted,
                                ":hover": {
                                    ...(!location.pathname.includes("scheduler") && { color: theme.textNormal }),
                                    borderBottom: "3px",
                                    borderRadius: "0.2rem",
                                    borderStyle: "solid",
                                    borderColor: "hsla(251, 100%, 50%, 0.52)"
                                },
                                ...(location.pathname.includes("scheduler") && { color: theme.textStrong })
                            }}>
                                Scheduler
                            </Typography>
                        </Link>
                    </nav>
                )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Link to="/signin">
                    <Button
                        variant="contained"
                        sx={{
                            margin: "0.3rem",
                            padding: '0.5rem 0.8rem',
                            borderRadius: '10px',
                            backgroundColor: 'hsl(251, 100%, 65%)',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 600,
                            border: 'none',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',

                            '&:hover': {
                                backgroundColor: 'hsl(251, 100%, 55%)',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        Sign Out
                    </Button>
                </Link>
            </Box>
        </header >
    );
}