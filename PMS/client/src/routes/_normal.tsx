import Breadcrumbs from "@/components/breadcrumbs.component";
import Header from "@/components/header.component";
import { Box } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_normal")({
    component: LayoutComponent
})

function LayoutComponent() {
    return (
        <>
            <Header showNavlinks={true} />
            <Breadcrumbs />
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                marginLeft: "4.5vw",
                marginRight: "3vw",
                height: "84vh",
                columnGap: "2vw"
            }}>
                <Outlet />
            </Box>
        </>
    )
}