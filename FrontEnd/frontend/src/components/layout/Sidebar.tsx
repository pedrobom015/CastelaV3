import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useAppStore } from "../../store/appStore";
import { MODULES, getActiveModule } from "../../config/modules";
import { useThemeStore } from "../../store/themeStore";
import { ModuleSelectModal } from "./ModuleSelectModal";

const GridIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		viewBox="0 0 24 24"
		width="22"
		height="22"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="3" width="7" height="7" rx="1" />
		<rect x="14" y="3" width="7" height="7" rx="1" />
		<rect x="3" y="14" width="7" height="7" rx="1" />
		<rect x="14" y="14" width="7" height="7" rx="1" />
	</svg>
);

const LogoutIcon = () => (
	<svg
		viewBox="0 0 24 24"
		width="16"
		height="16"
		fill="none"
		stroke="#e05a3a"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<polyline points="16 17 21 12 16 7" />
		<line x1="21" y1="12" x2="9" y2="12" />
	</svg>
);

export function Sidebar() {
	const { user } = useAuth();
	const { dirHandle, tables } = useAppStore();
	const isConfigured =
		!!dirHandle && tables instanceof Map && tables.size > 0;
	const navigate = useNavigate();
	const location = useLocation();
	const activeMod = getActiveModule(location.pathname);
	const LS_KEY = `presserv_active_module_${user?.uid ?? "guest"}`;
	const [isModuleOpen, setIsModuleOpen] = useState(false);
	const [showHint, setShowHint] = useState(false);

	// Abre modal automaticamente se não há módulo salvo no localStorage
	useEffect(() => {
		const saved = localStorage.getItem(LS_KEY);
		if (!saved) {
			setIsModuleOpen(true);
			return;
		}
		// Navega para o módulo salvo se estiver na raiz
		if (location.pathname === "/" || location.pathname === "") {
			const mod = MODULES.find((m) => m.id === saved);
			if (mod) {
				if (mod.requiresSetup && !isConfigured) {
					navigate("/setup");
				} else {
					navigate(mod.sessions[0]?.path ?? `/${mod.id}`);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleLogout = async () => {
		await signOut(auth);
		navigate("/login", { replace: true });
	};

	const handleModuleClick = (modId: string) => {
		const mod = MODULES.find((m) => m.id === modId);
		if (!mod) return;
		const isFirstTime = !localStorage.getItem(LS_KEY);
		localStorage.setItem(LS_KEY, modId);
		setIsModuleOpen(false);
		if (isFirstTime) {
			setTimeout(() => {
				setShowHint(true);
				setTimeout(() => setShowHint(false), 4000);
			}, 600);
		}
		if (mod.requiresSetup && !isConfigured) {
			navigate("/setup");
			return;
		}
		navigate(mod.sessions[0]?.path ?? `/${mod.id}`);
	};

	const { theme, setTheme } = useThemeStore();
	const primary =
		theme === "orange"
			? "#ff914d"
			: theme === "gray"
				? "#248094"
				: "#1e3a8a";
	const primaryLight =
		theme === "orange"
			? "#fff8f4"
			: theme === "gray"
				? "#f8fafc"
				: "#eff6ff";
	const primaryIconBg =
		theme === "orange"
			? "#fff3eb"
			: theme === "gray"
				? "#f1f5f9"
				: "#dbeafe";

	const displayName =
		user?.displayName || user?.email?.split("@")[0] || "Usuário";
	const photoURL = user?.photoURL;

	return (
		<aside
			className="flex flex-col flex-shrink-0 h-full"
			style={{
				width: 220,
				borderRight: "1px solid #e8e8e8",
				background: "#eff2f5",
			}}
		>
			<style>{`
				@keyframes fadeSlideIn {
					from { opacity: 0; transform: translateY(-50%) translateX(-6px); }
					to   { opacity: 1; transform: translateY(-50%) translateX(0); }
				}
			`}</style>

			{/* Botão de módulos — fixo sobre tudo */}
			<div
				style={{
					position: "fixed",
					top: 12,
					left: 12,
					zIndex: 55,
				}}
			>
				<div className="relative">
					<button
						onClick={() => {
							setIsModuleOpen((prev) => !prev);
							setShowHint(false);
						}}
						title="Selecionar Módulo"
						className="group flex items-center justify-center w-9 h-9 bg-white rounded-md border border-slate-200 shadow-md text-slate-500 hover:text-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0"
						style={
							showHint
								? {
										borderColor: "#6366f1",
										color: "#6366f1",
										boxShadow: "0 0 0 3px #e0e7ff",
									}
								: {}
						}
					>
						<GridIcon
							className={`transition-transform duration-500 ${isModuleOpen ? "rotate-90" : ""}`}
						/>
					</button>

					{/* Ping ao redor do botão */}
					{showHint && (
						<span
							className="absolute inset-0 rounded-2xl animate-ping"
							style={{ background: "#6366f1", opacity: 0.25 }}
						/>
					)}

					{/* Tooltip callout */}
					{showHint && (
						<div
							className="absolute left-11 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-xs font-medium whitespace-nowrap"
							style={{
								background: "#312e81",
								color: "#fff",
								zIndex: 60,
								animation: "fadeSlideIn 0.3s ease",
							}}
						>
							{/* seta esquerda */}
							<span
								className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
								style={{ background: "#312e81" }}
							/>
							<svg
								viewBox="0 0 24 24"
								width="13"
								height="13"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
							>
								<rect x="3" y="3" width="7" height="7" rx="1" />
								<rect
									x="14"
									y="3"
									width="7"
									height="7"
									rx="1"
								/>
								<rect
									x="3"
									y="14"
									width="7"
									height="7"
									rx="1"
								/>
								<rect
									x="14"
									y="14"
									width="7"
									height="7"
									rx="1"
								/>
							</svg>
							Clique aqui para trocar de módulo
						</div>
					)}
				</div>
			</div>

			{/* Espaço reservado para o botão fixo não sobrepor o logo */}
			<div style={{ height: 48 }} />

			{/* Logo centralizado */}
			<div className="flex items-center justify-center py-3">
				<img src="/logobp.png" alt="presserv" style={{ height: 50 }} />
			</div>

			{/* Seletor de tema */}
			<div className="flex items-center justify-center gap-2 pb-2">
				<button
					onClick={() => setTheme("blue")}
					title="Tema Azul"
					className="w-4 h-4 rounded-full transition-all"
					style={{
						background: "#1e3a8a",
						outline: theme === "blue" ? "2px solid #888" : "none",
						outlineOffset: 2,
					}}
				/>
				<button
					onClick={() => setTheme("orange")}
					title="Tema Laranja"
					className="w-4 h-4 rounded-full transition-all"
					style={{
						background: "#ff914d",
						outline: theme === "orange" ? "2px solid #888" : "none",
						outlineOffset: 2,
					}}
				/>
				{/* <button
					onClick={() => setTheme("gray")}
					title="Tema Cinza"
					className="w-4 h-4 rounded-full transition-all"
					style={{
						background: "#248094",
						outline: theme === "gray" ? "2px solid #888" : "none",
						outlineOffset: 2,
					}}
				/> */}
			</div>

			{/* Corpo: coluna ícones + coluna sessões */}
			<div className="flex flex-1 overflow-hidden">
				{/* Coluna esquerda — ícones */}
				<div
					className="flex flex-col items-center pt-4 gap-1 flex-shrink-0"
					style={{ width: 56, borderRight: "1px solid #f0f0f0" }}
				>
					{MODULES.map((mod) => {
						const isActive = activeMod?.id === mod.id;
						return (
							<button
								key={mod.id}
								onClick={() => handleModuleClick(mod.id)}
								title={mod.label}
								className="flex items-center justify-center rounded-xl transition-colors"
								style={{
									width: 40,
									height: 40,
									background: isActive
										? primaryIconBg
										: "transparent",
								}}
							>
								<mod.Icon active={isActive} color={primary} />
							</button>
						);
					})}
				</div>

				{/* Coluna direita — sessões do módulo ativo */}
				<div className="flex-1 flex flex-col pt-4 overflow-y-auto">
					{activeMod?.sessions.map((session) => {
						const isActiveSession = location.pathname.startsWith(
							session.path,
						);
						return (
							<button
								key={session.path}
								onClick={() => navigate(session.path)}
								className="text-left px-4 py-2 text-xs transition-colors w-full whitespace-nowrap overflow-hidden text-ellipsis"
								style={{
									color: isActiveSession ? primary : "#555",
									borderTopLeftRadius: 10,
									borderBottomLeftRadius: 10,
									fontWeight: isActiveSession ? 600 : 400,
									background: isActiveSession
										? primaryLight
										: "transparent",
								}}
								onMouseEnter={(e) => {
									if (!isActiveSession)
										(
											e.currentTarget as HTMLElement
										).style.background = "#fafafa";
								}}
								onMouseLeave={(e) => {
									if (!isActiveSession)
										(
											e.currentTarget as HTMLElement
										).style.background = "transparent";
								}}
							>
								{session.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Rodapé */}
			<div
				className="flex flex-col gap-1 p-3"
				style={{ borderTop: "1px solid #e0e0e0" }}
			>
				<div className="flex items-center gap-2 px-1 py-1">
					{photoURL ? (
						<img
							src={photoURL}
							alt="avatar"
							className="w-7 h-7 rounded-full object-cover flex-shrink-0"
						/>
					) : (
						<div
							className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
							style={{ background: primary }}
						>
							{displayName.charAt(0).toUpperCase()}
						</div>
					)}
					<span className="text-xs font-medium truncate text-gray-600">
						{displayName}
					</span>
				</div>
				<button
					onClick={handleLogout}
					className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full transition-colors hover:bg-red-50 text-left"
				>
					<LogoutIcon />
					<span
						className="text-xs font-medium"
						style={{ color: "#e05a3a" }}
					>
						Sair
					</span>
				</button>
				<span
					className="text-center text-gray-400 mt-1"
					style={{ fontSize: 10 }}
				>
					v1.0.15
				</span>
			</div>

			<ModuleSelectModal
				isOpen={isModuleOpen}
				onClose={() => setIsModuleOpen(false)}
				activeMod={activeMod}
				primary={primary}
				primaryLight={primaryLight}
				onModuleClick={handleModuleClick}
			/>
		</aside>
	);
}
