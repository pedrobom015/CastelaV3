import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { useAppStore } from "../../store/appStore";
import { useState, useEffect } from "react";

const SESSION_TOTAL = 30 * 60; // TODO: restaurar para 30 * 60 em producao
const SESSION_WARN = 5 * 60; // TODO: restaurar para  5 * 60 em producao

export function MainLayout() {
	const {
		loading,
		loadProgress,
		loadMessage,
		dirHandle,
		tables,
		setDirHandle,
	} = useAppStore();

	const IS_DEMO = import.meta.env.VITE_MODE_DEMO === "true";

	const [secsLeft, setSecsLeft] = useState(SESSION_TOTAL);

	useEffect(() => {
		if (!IS_DEMO) return;
		const id = setInterval(() => {
			setSecsLeft((s) => Math.max(0, s - 1));
		}, 1000);
		return () => clearInterval(id);
	}, []);

	const needsReconnect =
		!IS_DEMO && !dirHandle && tables instanceof Map && tables.size > 0;

	async function handleReconnect() {
		try {
			const handle = await (window as any).showDirectoryPicker({
				mode: "readwrite",
			});
			setDirHandle(handle, handle.name);
		} catch {
			// usuário cancelou
		}
	}

	return (
		<div className="flex flex-col h-full bg-gray-100">
			<TopNav />

			{/* Modal de sessão expirada */}
			{IS_DEMO && secsLeft === 0 && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 99999,
						backdropFilter: "blur(4px)",
						WebkitBackdropFilter: "blur(4px)",
						background: "rgba(0,0,0,0.4)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							background: "#fff",
							borderRadius: 12,
							padding: "32px 40px",
							boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
							textAlign: "center",
							maxWidth: 320,
						}}
					>
						<p
							style={{
								fontWeight: 700,
								fontSize: 16,
								marginBottom: 8,
								color: "#1a1a1a",
							}}
						>
							Sessão expirada
						</p>
						<p
							style={{
								fontSize: 13,
								color: "#666",
								marginBottom: 24,
							}}
						>
							Sua sessão expirou. Recarregue a página para
							continuar.
						</p>
						<button
							onClick={() => window.location.reload()}
							style={{
								background: "#ff914d",
								color: "#fff",
								border: "none",
								borderRadius: 6,
								padding: "8px 24px",
								fontSize: 14,
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							Recarregar
						</button>
					</div>
				</div>
			)}

			{/* Banner de expiração de sessão */}
			{IS_DEMO && secsLeft > 0 && secsLeft <= SESSION_WARN && (
				<div
					className="flex items-center justify-between px-4 py-2 text-sm"
					style={{
						background: "#fff3cd",
						borderBottom: "1px solid #ffc107",
					}}
				>
					<span className="text-yellow-800">
						⚠️ Sessão expira em {Math.floor(secsLeft / 60)}:
						{String(secsLeft % 60).padStart(2, "0")}. Salve seus
						dados antes de recarregar.
					</span>
					<button
						onClick={() => window.location.reload()}
						className="ml-4 px-3 py-1 rounded text-sm font-medium text-white"
						style={{ background: "#ff914d" }}
					>
						Recarregar agora
					</button>
				</div>
			)}

			{/* Banner de reconexão do diretório */}
			{needsReconnect && (
				<div
					className="flex items-center justify-between px-4 py-2 text-sm"
					style={{
						background: "#fff3cd",
						borderBottom: "1px solid #ffc107",
					}}
				>
					<span className="text-yellow-800">
						⚠️ Diretório DBF desconectado. As alterações não serão
						salvas até reconectar.
					</span>
					<button
						onClick={handleReconnect}
						className="ml-4 px-3 py-1 rounded text-sm font-medium text-white"
						style={{ background: "#ff914d" }}
					>
						Reconectar diretório
					</button>
				</div>
			)}

			{/* Loading overlay */}
			{loading && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
					<div className="bg-white rounded-lg p-6 shadow-xl w-80">
						<h3 className="text-lg font-semibold mb-3 text-gray-800">
							Carregando dados...
						</h3>
						<div className="w-full bg-gray-200 rounded-full h-3 mb-2">
							<div
								className="bg-blue-600 h-3 rounded-full transition-all duration-300"
								style={{ width: `${loadProgress}%` }}
							/>
						</div>
						<p className="text-sm text-gray-500">{loadMessage}</p>
						<p className="text-sm font-medium text-blue-900 mt-1">
							{loadProgress.toFixed(0)}%
						</p>
					</div>
				</div>
			)}

			{/* Conteúdo principal */}
			<main className="flex-1 overflow-auto p-4">
				<Outlet />
			</main>

			{/* Rodapé */}
			{/*      <footer className="bg-[rgb(255,145,77)] text-blue-300 text-xs px-4 py-1 flex justify-between">
        <span>Presserv Informática Ltda - (19) 99886-3225</span>
        <span>v2.0 Web</span>
      </footer> */}
		</div>
	);
}
