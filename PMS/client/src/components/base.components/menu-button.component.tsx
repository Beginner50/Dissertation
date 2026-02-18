import { useState, type ReactNode } from "react";
import { IconButton, Menu } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { theme } from "../../lib/theme";

export default function MenuButton({ children }: { children: ReactNode }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton size="small" onClick={handleOpen} sx={{ color: theme.textStrong }}>
        <MoreVertIcon sx={{ fontSize: "1.4rem" }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 140,
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
            },
          },
        }}>
        {children}
      </Menu>
    </>
  );
}
