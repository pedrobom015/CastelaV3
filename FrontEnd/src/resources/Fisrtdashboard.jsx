import { useEffect, useState } from "react";
import { usePermissions } from "react-admin";
import { Box, CardContent, Typography, useMediaQuery } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { motion } from "framer-motion";
import { useModule } from "../routes/context/ModuleContext";

export const MyDashboard = () => {
	const { isLoading } = usePermissions();
	const isMobile = useMediaQuery("(max-width:750px)");

	const { hasModules } = useModule();

	if (isLoading) return <span>Carregando...</span>;

	return (
		!hasModules && (
			<Box
				sx={{
					display: "flex",
					height: "30vh",
					justifyContent: "center",
				}}
			>
				<CardContent
					sx={{
						display: "flex",
						justifyContent: "center",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
					}}
				>
					<motion.div
						animate={{
							rotate: [-5, 5, -5],
							scale: [1, 1.05, 1],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							repeatType: "loop",
							ease: "easeInOut",
						}}
					>
						<LockIcon fontSize="large" sx={{ color: "#ff914d" }} />
					</motion.div>
					<Typography
						variant={isMobile ? "h8" : "h6"}
						color="#ff914d"
					>
						Você ainda não tem permissões atribuídas.
					</Typography>
					<Typography>
						Contate o administrador para liberar seu acesso.
					</Typography>
				</CardContent>
			</Box>
		)
	);
};
