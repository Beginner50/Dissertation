import { theme } from "../../lib/theme";
import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material"
import { useMemo } from "react";
import { Link, useLocation } from "react-router";

export type BreadcrumbLinkType = {
    url: string,
    text: string
}

function getProjectName(projectID: string) {
    return "Project";
}

function getTaskName(projectID: string, taskID: string) {
    return "Task";
}

export default function Breadcrumbs() {
    const location = useLocation();
    const pathname = location.pathname;

    const breadcrumbLinks = useMemo(() => {
        let breadcrumbLinks = [];
        if (pathname.startsWith("/projects")) {
            breadcrumbLinks.push({ url: "/projects", text: "Projects" });

            const projectMatch = pathname.match(/^\/projects\/(\d+)\/?(tasks)?/);
            if (projectMatch && projectMatch[1]) {
                const projectID = projectMatch[1];

                breadcrumbLinks.push({
                    url: `/projects/${projectID}/tasks`,
                    text: getProjectName(projectID)
                })

                const taskMatch = pathname.match(/^\/projects\/(\d+)\/tasks\/(\d+)/);
                if (taskMatch && taskMatch[2]) {
                    const taskID = taskMatch[2];

                    breadcrumbLinks.push({
                        url: `/projects/${projectID}/tasks/${taskID}`,
                        text: getTaskName(projectID, taskID)
                    })

                }
            }
        }

        return breadcrumbLinks;
    }, [location]);

    return (
        <div>
            <MuiBreadcrumbs
                sx={{
                    marginLeft: "5vw",
                    marginTop: "1.5vh",
                    marginBottom: "1.5vh"
                }}>
                {breadcrumbLinks.map((breadcrumbLink, index) => {
                    const isLast = index === breadcrumbLinks.length - 1;
                    return (
                        <Link
                            to={breadcrumbLink.url}
                            key={breadcrumbLink.url}
                        >
                            <Typography sx={{
                                ":hover": {
                                    textDecoration: "underline"
                                },
                                fontFamily: "sans-serif",
                                fontSize: "1.05rem",
                                fontWeight: "600",
                                color: isLast ? theme.textStrong : theme.textMuted,
                                cursor: isLast ? "default" : "pointer"
                            }}>
                                {breadcrumbLink.text}
                            </Typography>
                        </Link>
                    );
                })}
            </MuiBreadcrumbs>
        </div>
    )
}