import { Outlet } from "react-router";
import Breadcrumbs from "./breadcrumbs.component";
import Header from "./header.component";
import { Box } from "@mui/material";

export default function NormalLayout() {
  return (
    <>
      <Header showNavlinks={true} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "92vh",
        }}
      >
        <Breadcrumbs />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            marginLeft: "4.5vw",
            marginRight: "3vw",
            marginBottom: "2vh",
            columnGap: "2vw",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
