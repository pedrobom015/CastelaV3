// src/components/layout/MyAppBar.jsx
import { useEffect, useState } from "react";
import { AppBar, Title, Notification, UserMenu } from "react-admin";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/MailOutline";
import PaletteIcon from "@mui/icons-material/Palette";
import useMediaQuery from "@mui/material/useMediaQuery"; // Importe o hook
import PermissionSelector from "../../resources/PermissionSelector";
import HomeIcon from "@mui/icons-material/Home";
import authProvider from "../../routes/authProvider";
import { getUnitName } from "../../routes/dataProvider";
import { useModule } from "../../routes/context/ModuleContext";

const MyUserMenu = (props) => <UserMenu {...props}></UserMenu>;

export default function MyAppBar(props) {
	const isMobile = useMediaQuery("(max-width:750px)");
	const [openselect, setOpenselect] = useState(false);
	const [nameunit, setNameUnit] = useState();
	const { colorlb, activeModule, gerais } = useModule();

	useEffect(() => {
		try {
			const unit = getUnitName();

			const nameE = localStorage.getItem("NomeEmpresa");
			if (!gerais && !activeModule) return;
			gerais?.map((item) => {
				if (item?.id == activeModule?.id) {
					setNameUnit(nameE);
				} else {
					setNameUnit(unit);
				}
			});
		} catch (err) {
			console.warn("Erro ao obter unidade:", err);
			setNameUnit("");
		}
	}, [openselect, activeModule, gerais]);

	return (
		<AppBar
			{...props}
			userMenu={<MyUserMenu />}
			sx={{
				backgroundColor: colorlb,
				"& button[aria-label='Refresh']": {
					display: "none",
				},
				"& .RaAppBar-menuButton": {
					ml: 1, // equivale a margin-left: 8px
					mr: 1, // equivale a margin-right: 8px
				},
			}}
		>
			<div
				style={{
					display: "flex",
					/* 	marginLeft: open && !isMobile ? 200 : 20, */
					alignItems: "center",
					transition: "margin-left 0.3s ease-in-out",
				}}
			>
				<IconButton color="inherit" onClick={() => setOpenselect(true)}>
					<HomeIcon />
				</IconButton>
				<span
					style={{
						padding: 5,
						fontFamily: "'Orbitron', sans-serif",
						fontSize: 12,
					}}
				>
					{nameunit}
				</span>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					flex: 1,
					justifyContent: "end",
					transition: "margin-left 0.3s ease-in-out",
					marginLeft: 10,
					/* 	marginLeft: open && !isMobile ? 10 : 20, */
				}}
			>
				<PermissionSelector
					openselect={openselect}
					setOpenselect={setOpenselect}
				/>

				<IconButton color="inherit">
					<Badge badgeContent={1} color="error">
						<MailIcon />
					</Badge>
				</IconButton>
				{/* Ícone de tema */}
				<IconButton color="inherit">
					<PaletteIcon />
				</IconButton>
				{/* Avatar */}
				{/* Notificações padrão (badge de alertas) */}
				<Notification />
			</div>
		</AppBar>
	);
}
