import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { useAuth } from "../../contexts/AuthContext";
import { loadTables, DEMO_DIR_HANDLE } from "../../services/dbf/dataSource";

export function SetupPage() {
	const navigate = useNavigate();
	const { user: firebaseUser } = useAuth();
	const { setTables, setLoading, setUsuario, setDirHandle } = useAppStore();
	const [status, setStatus] = useState("Carregando dados...");
	const [error, setError] = useState("");

	// Deriva nome do usuário logado no Firebase: displayName ou parte local do email
	const nomeFirebase = firebaseUser?.displayName
		?? firebaseUser?.email?.split("@")[0]
		?? "ADMIN";
	const [usuario, setUsuarioLocal] = useState(nomeFirebase.toUpperCase());
	const [progress, setProgress] = useState(0);
	const [carregado, setCarregado] = useState(false);

	// Atualiza o campo se o Firebase resolver o usuário após o mount
	useEffect(() => {
		if (firebaseUser) {
			const nome = (firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "ADMIN")
				.toUpperCase();
			setUsuarioLocal(nome);
		}
	}, [firebaseUser]);

	useEffect(() => {
		carregarDados();
	}, []);

	async function carregarDados() {
		setError("");
		setCarregado(false);
		setLoading(true, 0, "Carregando dados...");
		try {
			const tables = await loadTables((loaded, total, name) => {
				const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
				setProgress(pct);
				setStatus(`Lendo ${name}... (${loaded}/${total})`);
				setLoading(true, pct, `Lendo ${name}...`);
			});
			setTables(tables);
			// Em modo demo, injeta handle fictício para desbloquear guards de escrita
			if (import.meta.env.VITE_MODE_DEMO === 'true') {
				setDirHandle(DEMO_DIR_HANDLE, 'backend')
			}
			setLoading(false);
			setCarregado(true);
			setStatus(`${tables.size} arquivos carregados.`);
		} catch (e) {
			setLoading(false);
			setError(
				`Erro ao carregar dados: ${e instanceof Error ? e.message : String(e)}`,
			);
		}
	}

	function handleEntrar() {
		if (!carregado) {
			setError("Aguarde o carregamento dos dados.");
			return;
		}
		if (!usuario.trim()) {
			setError("Informe o nome do usuário.");
			return;
		}
		setUsuario(usuario.trim(), 3);
		navigate("/lancamentos/contratos");
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-900 flex items-center justify-center p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
				{/* Header */}
				<div className="bg-gray-100 text-gray-800 p-6 text-center">
					<div className="text-4xl mb-2">⚱️</div>
					<h1 className="text-xl font-bold tracking-wide uppercase">
						ADP — Controle de Processos
					</h1>
					<p className="text-blue-300 text-sm mt-1">
						Presserv Informática Ltda
					</p>
				</div>

				{/* Body */}
				<div className="p-6 flex flex-col gap-4">
					{/* Progresso de carga */}
					<div>
						<div className="w-full bg-gray-200 rounded-full h-2 mb-2">
							<div
								className="bg-blue-600 h-2 rounded-full transition-all"
								style={{ width: `${progress}%` }}
							/>
						</div>
						{carregado ? (
							<p className="text-sm text-green-600 flex items-center gap-1">
								✓ {status}
							</p>
						) : (
							<p className="text-sm text-gray-500 flex items-center gap-2">
								<span className="animate-spin inline-block">⚙️</span>
								{status}
							</p>
						)}
					</div>

					{/* Recarregar */}
					{carregado && (
						<button
							onClick={carregarDados}
							className="w-full py-2 border border-orange-400 rounded-lg text-orange-700 hover:bg-orange-50 text-sm font-medium transition"
						>
							🔄 Recarregar dados
						</button>
					)}

					{/* Identificação */}
					<div>
						<h2 className="text-base font-semibold text-gray-700 mb-1">
							Identificação
						</h2>
						<input
							type="text"
							value={usuario}
							onChange={(e) =>
								setUsuarioLocal(e.target.value.toUpperCase())
							}
							placeholder="Nome do usuário"
							className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
							maxLength={50}
						/>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
							⚠️ {error}
						</div>
					)}

					<button
						onClick={handleEntrar}
						disabled={!carregado}
						className="w-full py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
					>
						Entrar no Sistema →
					</button>
				</div>

				<div className="bg-gray-50 px-6 py-3 text-xs text-gray-400 text-center border-t">
					Versão Web 2.0 — Desenvolvido com base no sistema original
					ADPBIG
				</div>
			</div>
		</div>
	);
}
