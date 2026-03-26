import { useEffect } from "react";
import { MODULES } from "../../config/modules";
import type { ModuleDef } from "../../config/modules";

const CloseIcon = () => (
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
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

interface ModuleSlidePanelProps {
	isOpen: boolean;
	onClose: () => void;
	activeMod: ModuleDef | undefined;
	primary: string;
	primaryLight: string;
	onModuleClick: (modId: string) => void;
}

const SIDEBAR_WIDTH = 220;

export function ModuleSlidePanel({
	isOpen,
	onClose,
	activeMod,
	primary,
	primaryLight,
	onModuleClick,
}: ModuleSlidePanelProps) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40"
				style={{
					background: "rgba(15,23,42,0.3)",
					backdropFilter: "blur(2px)",
					opacity: isOpen ? 1 : 0,
					pointerEvents: isOpen ? "auto" : "none",
					transition: "opacity 0.25s ease",
				}}
				onClick={onClose}
			/>

			{/* Slide panel */}
			<div
				className="fixed top-0 z-50 h-full bg-white flex flex-col"
				style={{
					left: SIDEBAR_WIDTH,
					width: "min(760px, calc(100vw - 220px))",
					transform: isOpen ? "translateX(0)" : "translateX(-110%)",
					transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
					boxShadow: "6px 0 40px rgba(0,0,0,0.14)",
					overflowX: "hidden",
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-10 pt-8 pb-6 flex-shrink-0">
					<div>
						<h2 className="text-2xl font-bold text-slate-800">
							Painel de{" "}
							<span style={{ color: primary }}>Módulos</span>
						</h2>
						<p className="text-slate-500 text-sm mt-1">
							Selecione o módulo que deseja utilizar.
						</p>
					</div>
					<button
						onClick={onClose}
						className="flex items-center justify-center rounded-full transition-colors"
						style={{
							width: 40,
							height: 40,
							background: "#f1f5f9",
							color: "#64748b",
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

				{/* Grid de módulos */}
				<div
					className="px-10 pb-10 overflow-y-auto flex-1 grid gap-5"
					style={{
						gridTemplateColumns: `repeat(${Math.min(MODULES.length, 3)}, 1fr)`,
						alignContent: "start",
					}}
				>
					{MODULES.map((mod) => {
						const isActive = activeMod?.id === mod.id;
						return (
							<button
								key={mod.id}
								onClick={() => onModuleClick(mod.id)}
								className="flex flex-col text-left p-5 rounded-2xl transition-all duration-200"
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
										).style.border = `2px solid ${primary}50`;
										(
											e.currentTarget as HTMLElement
										).style.boxShadow = `0 4px 16px ${primary}18`;
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
								{/* cabeçalho: ícone + título */}
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
									<div>
										<div
											className="text-sm leading-tight"
											style={{
												fontWeight: isActive ? 700 : 500,
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

								{/* descrição */}
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

								{/* preview */}
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
											height: 110,
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
					className="flex items-center px-10 py-4 text-xs text-slate-400 flex-shrink-0"
					style={{
						borderTop: "1px solid #f1f5f9",
						background: "#fafafa",
					}}
				>
					<span>Clique fora ou ESC para fechar</span>
				</div>
			</div>
		</>
	);
}
