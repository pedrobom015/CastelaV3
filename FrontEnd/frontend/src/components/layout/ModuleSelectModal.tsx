import { useEffect } from "react";
import { MODULES } from "../../config/modules";
import type { ModuleDef } from "../../config/modules";

const CloseIcon = () => (
	<svg
		viewBox="0 0 24 24"
		width="18"
		height="18"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

interface ModuleSelectModalProps {
	isOpen: boolean;
	onClose: () => void;
	activeMod: ModuleDef | undefined;
	primary: string;
	primaryLight: string;
	onModuleClick: (modId: string) => void;
}

export function ModuleSelectModal({
	isOpen,
	onClose,
	activeMod,
	primary,
	primaryLight,
	onModuleClick,
}: ModuleSelectModalProps) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<>
			<style>{`
				@keyframes slideInLeft {
					from { transform: translateX(-100%); opacity: 0; }
					to   { transform: translateX(0);    opacity: 1; }
				}
				@keyframes slideOutLeft {
					from { transform: translateX(0);    opacity: 1; }
					to   { transform: translateX(-100%); opacity: 0; }
				}
				@keyframes fadeInOverlay {
					from { opacity: 0; }
					to   { opacity: 1; }
				}
			`}</style>

			{/* Overlay */}
			<div
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 49,
					background: "rgba(15,23,42,0.35)",
					backdropFilter: "blur(3px)",
					opacity: isOpen ? 1 : 0,
					pointerEvents: isOpen ? "auto" : "none",
					transition: "opacity 0.3s ease",
				}}
			/>

			{/* Painel deslizante */}
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					height: "100vh",
					width: "min(860px, 92vw)",
					zIndex: 50,
					background: "#fff",
					boxShadow: "4px 0 32px rgba(0,0,0,0.18)",
					display: "flex",
					flexDirection: "column",
					transform: isOpen ? "translateX(0)" : "translateX(-100%)",
					opacity: isOpen ? 1 : 0,
					transition:
						"transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease",
					pointerEvents: isOpen ? "auto" : "none",
				}}
			>
				{/* Header */}
				<div
					className="flex items-center justify-between px-5 pt-4 pb-4 flex-shrink-0"
					style={{ borderBottom: "1px solid #f1f5f9" }}
				>
					<div className="flex flex-col items-start justify-center pl-10">
						<h2 className="text-lg font-bold text-slate-800">
							Painel de{" "}
							<span style={{ color: primary }}>Módulos</span>
						</h2>
						<p className="text-slate-400 text-xs mt-0.5">
							Selecione o módulo que deseja utilizar.
						</p>
					</div>
					<button
						onClick={onClose}
						className="flex items-center justify-center rounded-full transition-colors"
						style={{
							width: 34,
							height: 34,
							background: "#f1f5f9",
							color: "#64748b",
							flexShrink: 0,
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLElement).style.background =
								"#fee2e2";
							(e.currentTarget as HTMLElement).style.color =
								"#ef4444";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLElement).style.background =
								"#f1f5f9";
							(e.currentTarget as HTMLElement).style.color =
								"#64748b";
						}}
					>
						<CloseIcon />
					</button>
				</div>

				{/* Lista de módulos */}
				<div
					className="flex-1 overflow-y-auto px-6 py-5"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: 16,
						alignContent: "start",
					}}
				>
					{MODULES.map((mod) => {
						const isActive = activeMod?.id === mod.id;
						return (
							<button
								key={mod.id}
								onClick={() => onModuleClick(mod.id)}
								className="flex flex-col text-left p-4 rounded-2xl transition-all duration-200 w-full"
								style={{
									background: isActive
										? primaryLight
										: "#f8fafc",
									border: `2px solid ${isActive ? primary : "#e8eaed"}`,
									boxShadow: isActive
										? `0 4px 16px ${primary}22`
										: "none",
								}}
								onMouseEnter={(e) => {
									if (!isActive) {
										(
											e.currentTarget as HTMLElement
										).style.background = primaryLight;
										(
											e.currentTarget as HTMLElement
										).style.border =
											`2px solid ${primary}50`;
										(
											e.currentTarget as HTMLElement
										).style.boxShadow =
											`0 4px 12px ${primary}18`;
									}
								}}
								onMouseLeave={(e) => {
									if (!isActive) {
										(
											e.currentTarget as HTMLElement
										).style.background = "#f8fafc";
										(
											e.currentTarget as HTMLElement
										).style.border = "2px solid #e8eaed";
										(
											e.currentTarget as HTMLElement
										).style.boxShadow = "none";
									}
								}}
							>
								{/* Cabeçalho: ícone + título + badge */}
								<div className="flex items-center gap-3 mb-3">
									<div
										className="flex items-center justify-center flex-shrink-0"
										style={{
											width: 44,
											height: 44,
											borderRadius: 12,
											background: isActive
												? primary
												: "#e8eaed",
										}}
									>
										<mod.Icon
											active={isActive}
											color={
												isActive ? "#fff" : "#adb5bd"
											}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div
											className="text-sm leading-tight"
											style={{
												fontWeight: isActive
													? 700
													: 500,
												color: isActive
													? primary
													: "#4a5568",
											}}
										>
											{mod.label}
										</div>
										{isActive && (
											<span
												className="text-xs font-semibold px-2 py-0.5 rounded-full"
												style={{
													background: primary,
													color: "#fff",
												}}
											>
												Ativo
											</span>
										)}
									</div>
								</div>

								{/* Descrição */}
								{mod.description && (
									<p
										className="text-xs leading-relaxed mb-3"
										style={{
											color: isActive
												? primary + "bb"
												: "#94a3b8",
										}}
									>
										{mod.description}
									</p>
								)}

								{/* Preview */}
								{mod.preview ? (
									<img
										src={mod.preview}
										alt={`Preview ${mod.label}`}
										className="w-full rounded-xl"
										style={{
											height: 140,
											objectFit: "cover",
											border: `1px solid ${isActive ? primary + "33" : "#e2e8f0"}`,
											opacity: isActive ? 1 : 0.7,
										}}
									/>
								) : (
									<div
										className="w-full rounded-xl flex items-center justify-center"
										style={{
											height: 80,
											background: "#f1f5f9",
											border: "1px solid #e2e8f0",
										}}
									>
										<span className="text-slate-400 text-xs">
											{mod.sessions.length} seções
										</span>
									</div>
								)}
							</button>
						);
					})}
				</div>

				{/* Rodapé */}
				<div
					className="flex items-center px-6 py-3 text-xs text-slate-400 flex-shrink-0"
					style={{
						borderTop: "1px solid #f1f5f9",
						background: "#fafafa",
					}}
				>
					Clique fora ou ESC para fechar
				</div>
			</div>
		</>
	);
}
