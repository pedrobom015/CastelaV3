import { useEffect, useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	List,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import authProvider from "../routes/authProvider";
import { useModule } from "../routes/context/ModuleContext";
import { useNavigate } from "react-router-dom";
import { useSidebarState, useRefresh } from "react-admin";
import { useTheme } from "@mui/material/styles";
export default function PermissionSelector({ openselect, setOpenselect }) {
	const [perms, setPerms] = useState();
	const [open, setOpen] = useSidebarState();
	const theme = useTheme();
	const {
		activePermissionContext,
		setActivePermissionContext,
		activeModule,
		permissions,
	} = useModule();
	const navigate = useNavigate();
	const IsActvePermValid = perms?.length == 0 ? false : true;
	const nameE = localStorage.getItem("NomeEmpresa");
	useEffect(() => {
		setPerms(authProvider.getAllPermissions());
	}, []);

	useEffect(() => {
		if (perms?.length > 0) {
			const obj = perms[0];

			authProvider.setActivePermission(obj);
			setActivePermissionContext(obj);
		}
	}, [perms]);

	const handleSelect = (p) => {
		// Não executa se a unidade já estiver selecionada
		if (activeModule?.unit === p.system_unit_id) {
			return;
		}

		authProvider.setActivePermission(p);
		setActivePermissionContext(p);
		setOpenselect(false);
		if (!open) {
			setOpen(true);
		}
		const firstResource = p.modules[0].groups[0].resource;
		navigate(`/${firstResource}`);

		//window.location.reload();
	};

	return (
		IsActvePermValid && (
			<Dialog open={openselect} onClose={() => setOpenselect(false)}>
				<DialogTitle
					sx={{
						borderRadius: 0.5,
						background: theme.palette.primary.secondary,
						color: "white",
						fontSize: 18,
					}}
				>
					{nameE}
				</DialogTitle>
				<DialogContent
					sx={{ backgroundColor: "#ffffffff", padding: 0 }}
				>
					<List
						sx={{
							padding: 0,
							maxHeight: "180px",
						}}
					>
						{perms?.map((p) => {
							return (
								<ListItemButton
									sx={{
										borderRadius: 0.5,
										margin: 1.5,
										background: "transparent",
									}}
									key={p.system_unit_id}
									// Marca o item se ele for a permissão ativa
									selected={
										activeModule?.unit === p.system_unit_id
									}
									onClick={() => handleSelect(p)}
								>
									<ListItemText
										primaryTypographyProps={{
											sx: {
												color: theme.palette.primary
													.main,
											},
										}}
										secondaryTypographyProps={{
											sx: { color: "#333" },
										}}
										primary={p.system_unit_name}
										secondary={p.permission_name}
									/>
								</ListItemButton>
							);
						})}
					</List>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenselect(false)}>
						Cancelar
					</Button>
				</DialogActions>
			</Dialog>
		)
	);
}
