/**
 * AtendimentosGlobal — histórico completo da tabela ATEND800
 */
import { useState, useMemo, useRef, useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { PageHeader } from "../../components/common/PageHeader";
import { DataTable } from "../../components/common/DataTable";
import type { Column } from "../../components/common/DataTable";
import { formatDate } from "../../utils/formatters";
import { AtendimentosFrequencia } from "./AtendimentosFrequencia";

const TIPO_LABEL: Record<string, string> = {
	A: "Atendimento",
	R: "Recebimento",
	C: "Acordo",
};

const TIPO_COLOR: Record<string, string> = {
	A: "bg-blue-100 text-blue-800",
	R: "bg-green-100 text-green-700",
	C: "bg-orange-100 text-orange-700",
};

// ─── Multi-select de operadores ──────────────────────────────────────────────

interface OperadorSelectProps {
	operadores: string[];
	selecionados: Set<string>;
	onChange: (next: Set<string>) => void;
}

function OperadorSelect({
	operadores,
	selecionados,
	onChange,
}: OperadorSelectProps) {
	const [aberto, setAberto] = useState(false);
	const [busca, setBusca] = useState("");
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setAberto(false);
			}
		}
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const filtrados = operadores.filter((op) =>
		op.toLowerCase().includes(busca.toLowerCase()),
	);

	function toggle(op: string) {
		const next = new Set(selecionados);
		next.has(op) ? next.delete(op) : next.add(op);
		onChange(next);
	}

	function toggleTodos() {
		onChange(
			selecionados.size === operadores.length
				? new Set()
				: new Set(operadores),
		);
	}

	const label =
		selecionados.size === 0
			? "Todos"
			: selecionados.size === 1
				? Array.from(selecionados)[0]
				: `${selecionados.size} selecionados`;

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setAberto((v) => !v)}
				className="border rounded px-3 py-1.5 text-sm w-52 text-left flex items-center justify-between gap-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
			>
				<span className="truncate flex-1 text-sm">
					{selecionados.size === 0 ? (
						<span className="text-gray-400">Todos</span>
					) : (
						<span className="text-gray-800">{label}</span>
					)}
				</span>
				<svg
					className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${aberto ? "rotate-180" : ""}`}
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{aberto && (
				<div className="absolute z-50 mt-1 right-0 w-64 max-h-80 flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
					{/* Campo de busca */}
					<div className="p-2 border-b shrink-0">
						<input
							autoFocus
							type="text"
							value={busca}
							onChange={(e) => setBusca(e.target.value)}
							placeholder="Buscar operador..."
							className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
						/>
					</div>

					{/* Selecionar todos */}
					<div className="px-3 py-1.5 border-b shrink-0">
						<label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
							<input
								type="checkbox"
								checked={
									selecionados.size === operadores.length &&
									operadores.length > 0
								}
								onChange={toggleTodos}
								className="cursor-pointer"
							/>
							<span className="font-medium">
								Selecionar todos
							</span>
						</label>
					</div>

					{/* Lista com scroll */}
					<div className="overflow-y-auto flex-1">
						{filtrados.length === 0 ? (
							<p className="px-3 py-3 text-xs text-gray-400 italic">
								Nenhum resultado.
							</p>
						) : (
							filtrados.map((op) => (
								<label
									key={op}
									className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 select-none"
								>
									<input
										type="checkbox"
										checked={selecionados.has(op)}
										onChange={() => toggle(op)}
										className="cursor-pointer"
									/>
									<span className="truncate">{op}</span>
								</label>
							))
						)}
					</div>

					{/* Rodapé fixo */}
					<div className="px-3 py-1.5 border-t shrink-0 flex items-center justify-between min-h-[32px]">
						{selecionados.size > 0 ? (
							<>
								<span className="text-xs text-gray-500">
									{selecionados.size} selecionado(s)
								</span>
								<button
									onMouseDown={(e) => {
										e.preventDefault();
										onChange(new Set());
									}}
									className="text-xs text-red-500 hover:underline"
								>
									Limpar
								</button>
							</>
						) : (
							<span className="text-xs text-gray-300">
								Nenhum selecionado
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Colunas ─────────────────────────────────────────────────────────────────

const COLUMNS: Column[] = [
	{
		key: "numero",
		label: "Nº",
		width: "90px",
		render: (v) => (
			<span className="font-mono font-bold text-blue-900">
				{String(v ?? "").trim()}
			</span>
		),
	},
	{
		key: "data_",
		label: "Data",
		width: "95px",
		align: "center",
		render: (v) => (v ? formatDate(v as Date) : "—"),
	},
	{
		key: "hora",
		label: "Hora",
		width: "60px",
		align: "center",
		render: (v) => (
			<span className="font-mono">{String(v ?? "").trim() || "—"}</span>
		),
	},
	{
		key: "codigo",
		label: "Contrato",
		width: "90px",
		render: (v) => (
			<span className="font-mono">{String(v ?? "").trim()}</span>
		),
	},
	{
		key: "nome",
		label: "Nome",
		render: (v) => (
			<span className="block max-w-xs truncate">
				{String(v ?? "").trim() || "—"}
			</span>
		),
	},
	{
		key: "tipo",
		label: "Tipo",
		width: "120px",
		align: "center",
		sortable: false,
		render: (v) => {
			const tipo = String(v ?? "").trim();
			return (
				<span
					className={`inline-block w-24 text-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
						TIPO_COLOR[tipo] ?? "bg-gray-100 text-gray-700"
					}`}
				>
					{TIPO_LABEL[tipo] ?? (tipo || "—")}
				</span>
			);
		},
	},
	{
		key: "obs",
		label: "Observação",
		render: (v) => (
			<span className="block max-w-sm truncate text-gray-700">
				{String(v ?? "").trim() || "—"}
			</span>
		),
	},
	{
		key: "por",
		label: "Operador",
		width: "160px",
		align: "center",
		render: (v) => (
			<span className="font-medium">{String(v ?? "").trim() || "—"}</span>
		),
	},
	{
		key: "filial",
		label: "Filial",
		width: "60px",
		align: "center",
		render: (v) => String(v ?? "").trim() || "—",
	},
];

// ─── Página ───────────────────────────────────────────────────────────────────

function toYMD(val: unknown): string | null {
	if (!val) return null;
	const d = val instanceof Date ? val : new Date(val as string);
	if (isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AtendimentosGlobal() {
	const tables = useAppStore((s) => s.tables);

	const hoje = new Date();
	const hojeStr = toYMD(hoje) ?? "";

	const [busca, setBusca] = useState("");
	const [filtroTipo, setFiltroTipo] = useState("TODOS");
	const [operadoresSel, setOperadoresSel] = useState<Set<string>>(new Set());
	const [dataIni, setDataIni] = useState(hojeStr);
	const [dataFim, setDataFim] = useState(hojeStr);

	const atend800 = tables.get("atend800");

	const operadores = useMemo(() => {
		if (!atend800) return [];
		const set = new Set<string>();
		atend800.records.forEach((r) => {
			const por = String(r.por ?? "").trim();
			if (por) set.add(por);
		});
		return Array.from(set).sort();
	}, [atend800]);

	const registros = useMemo(() => {
		if (!atend800) return [];
		const termo = busca.trim().toLowerCase();

		return atend800.records
			.filter((r) => !r._deleted)
			.filter((r) => {
				if (
					filtroTipo !== "TODOS" &&
					String(r.tipo ?? "").trim() !== filtroTipo
				)
					return false;
				if (
					operadoresSel.size > 0 &&
					!operadoresSel.has(String(r.por ?? "").trim())
				)
					return false;
				// Filtro de data
				const ymd = toYMD(r.data_);
				if (dataIni && ymd && ymd < dataIni) return false;
				if (dataFim && ymd && ymd > dataFim) return false;
				if (termo) {
					return (
						String(r.numero ?? "")
							.toLowerCase()
							.includes(termo) ||
						String(r.codigo ?? "")
							.toLowerCase()
							.includes(termo) ||
						String(r.nome ?? "")
							.toLowerCase()
							.includes(termo) ||
						String(r.obs ?? "")
							.toLowerCase()
							.includes(termo)
					);
				}
				return true;
			})
			.sort((a, b) => {
				const na = parseInt(String(a.numero ?? "0")) || 0;
				const nb = parseInt(String(b.numero ?? "0")) || 0;
				return nb - na;
			});
	}, [atend800, busca, filtroTipo, operadoresSel, dataIni, dataFim]);

	const temFiltro =
		busca ||
		filtroTipo !== "TODOS" ||
		operadoresSel.size > 0 ||
		dataIni !== hojeStr ||
		dataFim !== hojeStr;

	return (
		<div className="p-4 w-full">
			<PageHeader
				title="Histórico do Recepção"
				subtitle={`${registros.length} registro(s) encontrado(s)`}
			/>

			{/* Filtros — linha única */}
			<div className="bg-white border rounded-lg px-4 py-3 mb-4 flex flex-wrap gap-2 items-end">
				{/* Busca */}
				<input
					type="text"
					value={busca}
					onChange={(e) => setBusca(e.target.value)}
					placeholder="Buscar: Nº, contrato, nome ou obs..."
					className="border rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-300"
				/>

				{/* Tipo */}
				<select
					value={filtroTipo}
					onChange={(e) => setFiltroTipo(e.target.value)}
					className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
				>
					<option value="TODOS">Todos os tipos</option>
					<option value="A">Atendimento</option>
					<option value="R">Recebimento</option>
					<option value="C">Acordo</option>
				</select>

				{/* Operador */}
				<OperadorSelect
					operadores={operadores}
					selecionados={operadoresSel}
					onChange={setOperadoresSel}
				/>

				{/* Separador */}
				<span className="text-gray-300 self-center text-lg">|</span>

				{/* Período */}
				<div className="flex items-center gap-1">
					<label className="text-xs text-gray-500 whitespace-nowrap">
						De
					</label>
					<input
						type="date"
						value={dataIni}
						onChange={(e) => setDataIni(e.target.value)}
						className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
					/>
				</div>
				<div className="flex items-center gap-1">
					<label className="text-xs text-gray-500 whitespace-nowrap">
						Até
					</label>
					<input
						type="date"
						value={dataFim}
						onChange={(e) => setDataFim(e.target.value)}
						className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
					/>
				</div>

				{temFiltro && (
					<button
						onClick={() => {
							setBusca("");
							setFiltroTipo("TODOS");
							setOperadoresSel(new Set());
							setDataIni(hojeStr);
							setDataFim(hojeStr);
						}}
						className="text-xs text-gray-400 underline self-center ml-1"
					>
						Limpar
					</button>
				)}
			</div>

			<AtendimentosFrequencia
				registros={registros}
				dataIni={dataIni}
				dataFim={dataFim}
			/>

			<DataTable
				columns={COLUMNS}
				data={registros}
				compact
				pageSize={10}
				emptyMessage={
					atend800
						? "Nenhum atendimento encontrado."
						: "Tabela ATEND800 não carregada."
				}
			/>
		</div>
	);
}
