// src/components/menu/SubMenu.jsx
import React, { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";

/**
 * text: rótulo do menu
 * icon: ícone fechado
 * children: <Menu.ResourceItem> ou <Menu.Item> aninhados
 */
export default function SubMenu({ text, icon, children }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<MenuItem onClick={() => setOpen(!open)}>
				<ListItemIcon>{open ? <ExpandLess /> : icon}</ListItemIcon>
				<ListItemText primary={text} />
			</MenuItem>
			<Collapse
				in={open}
				timeout="auto"
				unmountOnExit
				sx={{
					// aumenta o recuo dos itens filhos
					"& .RaMenuItemLink-icon": { pl: 4 },
				}}
			>
				{children}
			</Collapse>
		</>
	);
}
