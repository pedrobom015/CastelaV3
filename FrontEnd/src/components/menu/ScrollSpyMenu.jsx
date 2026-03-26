import React, { useCallback, useMemo, useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useModule } from "../../routes/context/ModuleContext";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

// Sub-componente memoizado para evitar o refresh visual individual
const NavIcon = memo(({ mod, isActive, onClick, theme, isGeral }) => {
	const Icon = mod.icon;
	return (
		<Box
			onClick={() => onClick(mod)}
			sx={{
				cursor: "pointer",
				color: isActive
					? isGeral
						? theme.palette.primary.secondary
						: theme.palette.primary.main
					: theme.palette.text.disabled,
				transition: "color 0.2s, transform 0.1s",
				paddingBottom: 2,
				"&:active": { transform: "scale(0.95)" },
			}}
		>
			<Box
				sx={{
					fontSize: 8,
					display: "flex",
					alignItems: "center",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<Icon fontSize="large" />
			</Box>
		</Box>
	);
});

export default function ScrollSpyMenu() {
	const theme = useTheme();
	const { pathname, hash } = useLocation(); // Destruturação para estabilidade
	const navigate = useNavigate();
	const { setActiveModule, permissions, gerais } = useModule();

	// 1. Extração estável do path (Valor Derivado)
	const currentPath = useMemo(() => {
		const raw = hash
			? hash.replace(/^#\/?/, "")
			: pathname.replace(/^\/?/, "");
		return raw.split("/").filter(Boolean)[0] || "";
	}, [hash, pathname]);

	// 2. Módulos unificados
	const allModules = useMemo(
		() => [...(permissions || []), ...(gerais || [])],
		[permissions, gerais],
	);

	// 3. Módulo Ativo (Valor Derivado - Resolve o flash de estado)
	const activeModule = useMemo(() => {
		if (allModules.length === 0) return null;
		return (
			allModules.find((m) =>
				m.sessions?.some((s) => s.resource === currentPath),
			) || allModules[0]
		);
	}, [allModules, currentPath]);

	// Sincroniza com o contexto externo apenas quando o ID do módulo realmente mudar
	useEffect(() => {
		if (activeModule) {
			setActiveModule(activeModule);
		}
	}, [activeModule?.id, setActiveModule]);

	const handleIconClick = useCallback(
		(clickedMod) => {
			if (clickedMod.id === activeModule?.id) return;
			const firstResource = clickedMod.sessions?.[0]?.resource;
			if (firstResource) {
				navigate(`/${firstResource}`);
			}
		},
		[navigate, activeModule?.id],
	);

	// 4. MEMOIZAÇÃO DA BARRA LATERAL (A "trava" contra o flash nos ícones)
	const sideBarIcons = useMemo(
		() => (
			<Box
				sx={{
					width: 80,
					bgcolor: theme.palette.sidebar,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					overflowY: "auto",
					height: "100%",
					borderRight: "2px solid rgba(0,0,0,0.12)",
					scrollbarWidth: "none",
					"&::-webkit-scrollbar": { display: "none" },
				}}
			>
				{permissions?.map((mod) => (
					<NavIcon
						key={mod.id}
						mod={mod}
						isActive={mod.id === activeModule?.id}
						onClick={handleIconClick}
						theme={theme}
						isGeral={false}
					/>
				))}
				{gerais?.map((mod) => (
					<NavIcon
						key={mod.id}
						mod={mod}
						isActive={mod.id === activeModule?.id}
						onClick={handleIconClick}
						theme={theme}
						isGeral={true}
					/>
				))}
			</Box>
		),
		[permissions, gerais, activeModule?.id, handleIconClick, theme],
	);

	return (
		<Box sx={{ display: "flex", height: "100%", width: 280 }}>
			{/* Ícones da Esquerda (Memoizados) */}
			{sideBarIcons}

			{/* Lista de Sessões (Direita) */}
			<Box
				component="ul"
				sx={{
					flex: 1,
					height: "100%",
					overflowY: "auto",
					m: 0,
					p: 0,
					listStyle: "none",
					bgcolor: "#eff2f5",
				}}
			>
				{activeModule?.sessions?.map((sess) => {
					const isActive = currentPath === sess.resource;
					const isGeralSess = sess.resource_type === "geral";

					return (
						<Box
							component="li"
							key={sess.resource}
							sx={{
								borderLeft: isActive
									? `4px solid ${theme.palette.primary.main}`
									: "4px solid transparent",
								bgcolor: isActive
									? theme.palette.primarySoft
									: "transparent",
								transition: "background-color 0.1s", // Transição rápida
							}}
						>
							<ListItemButton
								onClick={() =>
									!isActive && navigate(`/${sess.resource}`)
								}
								disableRipple
								sx={{
									py: 1,
									px: 2,
									"&.Mui-selected": {
										backgroundColor: isGeralSess
											? theme.palette.primary.secondary
											: "white",
										color: isGeralSess
											? "white"
											: theme.palette.primary.main,
									},
								}}
								selected={isActive}
							>
								<ListItemText
									primary={sess.label}
									primaryTypographyProps={{
										fontSize: "0.9rem",
										fontWeight: isActive ? 700 : 500,
									}}
								/>
							</ListItemButton>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
