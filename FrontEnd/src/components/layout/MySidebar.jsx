// src/components/layout/MySidebar.jsx
import React, { useEffect } from "react";
import { Sidebar, useSidebarState } from "react-admin";
import ScrollSpyMenu from "../menu/ScrollSpyMenu";
import { useTheme, useMediaQuery } from "@mui/material";
import imglogo from "../../assets/img/logo02.png";
import imghelp from "../../assets/img/HELP.png";
import imgimp from "../../assets/img/status.png";
import acme from "../../assets/img/acme.png";
import { LogoWithPopup } from "./Chatpopup";
import { useModule } from "../../routes/context/ModuleContext";

export default function MySidebar({ setShowPopup, ...props }) {
	const [open, setOpen] = useSidebarState();
	const theme = useTheme();
	const { sStatus } = useModule();

	const isMobile = useMediaQuery("(max-width:750px)");

	return (
		<Sidebar
			{...props}
			variant={isMobile ? "temporary" : "permanent"}
			sx={{
				"& .MuiDrawer-paper": {
					width: open ? 280 : 80,
					bgcolor: theme.palette.sidebar,
					transition: (theme) =>
						theme.transitions.create("width", {
							easing: theme.transitions.easing.sharp,
							duration: theme.transitions.duration.enteringScreen,
						}),
				},
				/* "& .RaSidebar-fixed": {
					position: "unset",
				}, */
			}}
		>
			<div style={{ width: "100%", height: "100%" }}>
				<div
					style={{
						paddingTop: 40,
						paddingBottom: 40,
						display: "flex",
						justifyContent: "center",
					}}
				>
					<img
						src={acme}
						alt="Logo da Empresa"
						style={{
							height: 40,
							padding: open ? 0 : 7,
							transform: open
								? "translateX(0)"
								: "translateX(calc((80px - 280px) / 2))",

							transition:
								"transform 300ms ease, padding 300ms ease",
						}}
					/>
				</div>
				<div
					style={{
						backgroundColor: "#eff2f5",
						height: "80vh",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<ScrollSpyMenu />
				</div>

				<div
					style={{
						/* backgroundColor: "#eff2f5", */
						backgroundColor: "#fff",

						width: "100%",
						bottom: 0,
						paddingTop: 8,
						paddingBottom: 8,
						position: "absolute",
					}}
				>
					{/*  footer sidebar */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-around",
						}}
					>
						<div
							style={{
								backgroundColor: sStatus
									? "#a6ffc8"
									: "#ffa6a6", // cor que você quer

								borderRadius: "4px", // opcional, bordas arredondadas
								paddingLeft: 15,
								paddingRight: 15,
								paddingTop: 5,
								paddingBottom: 5,
								display: "inline-block", // evita que a div ocupe toda a linha
							}}
						>
							<img
								src={imgimp}
								alt="Logo da Empresa"
								style={{ height: 25 }}
							/>
						</div>

						<img
							src={imglogo}
							alt="Logo da Empresa"
							style={{ height: 25 }}
						/>
						<LogoWithPopup
							imghelp={imghelp}
							setShowPopup={setShowPopup}
						/>
					</div>
				</div>
			</div>
		</Sidebar>
	);
}
