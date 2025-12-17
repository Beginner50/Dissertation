import { Archive, Edit } from "@mui/icons-material";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, type PopoverVirtualElement } from "@mui/material"

export default function ProjectMenu({ anchorElement, open, onClose }: {
    anchorElement: HTMLElement | PopoverVirtualElement |
    (() => HTMLElement | PopoverVirtualElement | null) | null | undefined
    open: boolean
    onClose?: () => void
}) {
    return (
        <Menu anchorEl={anchorElement}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                horizontal: "right",
                vertical: "top"
            }}
        >
            <MenuList sx={{ padding: 0, borderRadius: "0.4rem" }} >
                <MenuItem>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Edit
                    </ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem >
                    <ListItemIcon>
                        <Archive fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: "hsl(0, 96.80%, 36.90%)" }}>
                        Archive
                    </ListItemText>
                </MenuItem>
            </MenuList>
        </Menu>);
}