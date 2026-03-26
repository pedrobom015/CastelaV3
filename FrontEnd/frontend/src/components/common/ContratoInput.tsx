/**
 * ContratoInput — campo de seleção de contrato com lupinha
 * Lista paginada (10 itens, scroll infinito), busca por código/nome/CPF/telefone/cobrador.
 * Reutilizável em qualquer formulário que precise selecionar um contrato.
 */
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Modal } from "./Modal";
import { useAppStore } from "../../store/appStore";
import { searchRecords } from "../../utils/dbfHelpers";
import { formatCpf } from "../../utils/formatters";

export interface ContratoResumido {
	codigo: string;
	nome: string;
	cpf: string;
	telefone: string;
	grupo: string;
	cobrador: string;
	situacao: string;
}

interface ContratoInputProps {
	value: string;
	nomeContrato?: string;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	onSelect: (contrato: ContratoResumido) => void;
}

const PAGE_SIZE = 10;
const SEARCH_FIELDS = ["codigo", "nome", "cpf", "telefone", "cobrador"];

export function ContratoInput({
	value,
	nomeContrato,
	label = "Contrato",
	required,
	disabled,
	onSelect,
}: ContratoInputProps) {
	const { getTable } = useAppStore();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const listRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	// Todos os registros filtrados pela busca
	const filtered = useMemo(() => {
		const table = getTable("grupos");
		if (!table) return [];
		const results = searchRecords(table, search, SEARCH_FIELDS);
		return results
			.filter((r) => !r._deleted)
			.map((r) => ({
				codigo: String(r.codigo ?? "").trim(),
				nome: String(r.nome ?? "").trim(),
				cpf: String(r.cpf ?? "").trim(),
				telefone: String(r.telefone ?? "").trim(),
				grupo: String(r.grupo ?? "").trim(),
				cobrador: String(r.cobrador ?? "").trim(),
				situacao: String(r.situacao ?? "").trim(),
			}));
	}, [getTable, search]);

	// Slice visível (scroll infinito simulado)
	const visible = useMemo(
		() => filtered.slice(0, visibleCount),
		[filtered, visibleCount],
	);

	const hasMore = visibleCount < filtered.length;

	// Detecta scroll perto do fim e carrega mais
	const handleScroll = useCallback(() => {
		const el = listRef.current;
		if (!el || !hasMore) return;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
			setVisibleCount((prev) => prev + PAGE_SIZE);
		}
	}, [hasMore]);

	// Reset paginação ao mudar busca ou abrir
	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [search, open]);

	// Foca campo de busca ao abrir
	useEffect(() => {
		if (open) {
			setTimeout(() => searchRef.current?.focus(), 80);
		} else {
			setSearch("");
		}
	}, [open]);

	function handleSelect(c: ContratoResumido) {
		onSelect(c);
		setOpen(false);
	}

	return (
		<>
			<div className="flex flex-col gap-0.5">
				{nomeContrato && (
					<span className="text-sm text-gray-700 truncate font-medium">
						{nomeContrato}
					</span>
				)}
				{label && (
					<label className="text-sm font-medium text-gray-700">
						{label}
						{required && (
							<span className="text-red-500 ml-0.5">*</span>
						)}
					</label>
				)}
				<div className="flex gap-1 items-center">
					<input
						readOnly
						value={value ? String(value).padStart(9, "0") : ""}
						placeholder="000000000"
						disabled={disabled}
						className="border border-gray-300 rounded px-2 py-1 text-sm w-24 bg-white disabled:bg-gray-100 font-mono"
					/>
					<button
						type="button"
						onClick={() => !disabled && setOpen(true)}
						disabled={disabled}
						title="Buscar contrato"
						className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						🔍
					</button>
				</div>
			</div>

			<Modal
				isOpen={open}
				onClose={() => setOpen(false)}
				title="Selecionar Contrato"
				size="lg"
				footer={
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
					>
						Cancelar
					</button>
				}
			>
				<div className="flex flex-col gap-2">
					{/* Campo de busca */}
					<input
						ref={searchRef}
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por código, nome, CPF, telefone..."
						className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					{/* Cabeçalho da tabela */}
					<div className="grid grid-cols-[80px_1fr_110px_100px_50px] gap-2 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-gray-500 uppercase">
						<span>Código</span>
						<span>Nome</span>
						<span>CPF</span>
						<span>Telefone</span>
						<span className="text-center">Sit.</span>
					</div>

					{/* Lista com scroll infinito */}
					<div
						ref={listRef}
						onScroll={handleScroll}
						className="overflow-y-auto border border-gray-200 rounded"
						style={{ maxHeight: 340 }}
					>
						{visible.length === 0 ? (
							<div className="text-center text-sm text-gray-400 py-8">
								{search
									? "Nenhum contrato encontrado."
									: "Nenhum contrato disponível."}
							</div>
						) : (
							<>
								{visible.map((c, i) => (
									<div
										key={c.codigo + i}
										onClick={() => handleSelect(c)}
										className="grid grid-cols-[80px_1fr_110px_100px_50px] gap-2 px-2 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm"
									>
										<span className="font-mono text-gray-600">
											{c.codigo.padStart(9, "0")}
										</span>
										<span className="font-medium truncate">
											{c.nome}
										</span>
										<span className="text-gray-500 text-xs self-center">
											{formatCpf(c.cpf) || "—"}
										</span>
										<span className="text-gray-500 text-xs self-center">
											{c.telefone || "—"}
										</span>
										<span
											className={`text-xs font-bold text-center self-center px-1 rounded ${
												c.situacao === "1"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-600"
											}`}
										>
											{c.situacao === "1"
												? "Ativo"
												: c.situacao}
										</span>
									</div>
								))}
								{hasMore && (
									<div className="text-center text-xs text-gray-400 py-2 border-t border-gray-100">
										Role para carregar mais (
										{filtered.length - visibleCount}{" "}
										restantes)
									</div>
								)}
							</>
						)}
					</div>

					<p className="text-xs text-gray-400">
						{filtered.length} contrato(s) encontrado(s)
						{visibleCount < filtered.length
							? ` — exibindo ${visibleCount}`
							: ""}
					</p>
				</div>
			</Modal>
		</>
	);
}
