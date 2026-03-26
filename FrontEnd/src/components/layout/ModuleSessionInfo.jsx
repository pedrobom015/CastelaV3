import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useModule } from "../../routes/context/ModuleContext";

const ModuleSessionInfoContainer = styled("div")(({ theme }) => ({
	display: "flex",
	flex: 1,
	alignItems: "center",
}));

const Label = styled(motion.span)(({ theme }) => ({
	fontWeight: 400,
}));

const IconContainer = styled(motion.div)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
}));

const ModuleLabel = styled(Label)(({ theme }) => ({
	fontSize: "0.8rem",
	paddingLeft: 5,
}));

const Separator = styled(motion.span)(({ theme }) => ({
	fontSize: "0.8rem",
	paddingLeft: 4,
	fontWeight: 600,
	alignItems: "center",
}));

const SessionLabel = styled(Label)(({ theme }) => ({
	fontSize: "0.9rem",
	paddingLeft: 4,
	alignItems: "center",
}));

const variants = {
	initial: { opacity: 0, y: 5 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
	exit: { opacity: 0, y: -5, transition: { duration: 0.2 } },
};

export default function ModuleSessionInfo({ data }) {
	const {
		activeModule,
		activeSession,
		setActiveSession,
		permissions,
		gerais,
	} = useModule();
	const Icon = activeModule?.icon;

	const [sessionLocal, setSessionLocal] = useState();

	//resourceData

	// Use a unique key. If the label is null, use a fallback like an ID or a unique string.
	const moduleKey =
		activeModule?.label || activeModule?.id || "module-default-key";
	const sessionKey =
		activeSession?.label || activeSession?.id || "session-default-key";
	useEffect(() => {
		if (!permissions) return;

		const allModules = [...permissions, ...(gerais || [])];

		allModules?.forEach((item) => {
			item.sessions.forEach((itemg) => {
				if (data === itemg.resource) {
					setSessionLocal(itemg.label);
					setActiveSession(itemg.label);
				}
			});
		});
	}, [data, permissions]);

	const isPermValid = permissions.length == 0 || !permissions ? false : true;
	return (
		isPermValid && (
			<ModuleSessionInfoContainer
				sx={{
					display: "flex",
					justifyContent: "centerleft",
					alignItems: "center",
					fontSize: 10,
				}}
			>
				<AnimatePresence mode="wait">
					<>
						{Icon && <Icon fontSize="small" />}
						<ModuleLabel>{activeModule?.label}</ModuleLabel>
						{activeModule && (
							<Separator style={{ fontFamily: "monospace" }}>
								{`▣→`}
							</Separator>
						)}
						<SessionLabel
							key={sessionLocal} // Use the new unique key here
							variants={variants}
							initial="initial"
							animate="animate"
							exit="exit"
						>
							{sessionLocal}
						</SessionLabel>
					</>
				</AnimatePresence>
			</ModuleSessionInfoContainer>
		)
	);
}
