/**
 * FalecidoInput — campo de seleção de inscrito/falecido com lupinha
 * Exibe apenas os inscritos do contrato selecionado (INSCRITS.CODIGO = contrato).
 * Ao selecionar, retorna os dados do inscrito para preencher o formulário.
 *
 * Chave do inscrito: CODIGO(9) + GRAU(1) + SEQ(2 padded) = 12 chars = codigofal em AFUNER
 */
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Modal } from "./Modal";
import { useAppStore } from "../../store/appStore";
import { formatDate } from "../../utils/formatters";

export interface FalecidoResumido {
	/** chave completa 12 chars: codigo(9) + grau(1) + seq(2) */
	codigofal: string;
	/** INSCRITS.CODIGO = código do contrato */
	codigo: string;
	grau: string;
	seq: number;
	nome: string;
	nascto_: Date | null;
	vivofalec: string;
	ehtitular: string;
}

interface FalecidoInputProps {
	/** Código do contrato selecionado — filtra a lista de inscritos */
	contrato: string;
	value: string;
	nomeFalecido?: string;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	onSelect: (falecido: FalecidoResumido) => void;
}

const PAGE_SIZE = 20;

export function FalecidoInput({
	contrato,
	value,
	nomeFalecido,
	label = "Código do Falecido",
	required,
	disabled,
	onSelect,
}: FalecidoInputProps) {
	const { getTable } = useAppStore();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const listRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	const filtered = useMemo(() => {
		const table = getTable("inscrits");
		if (!table) return [];

		return table.records
			.filter((r) => {
				if (r._deleted) return false;
				// Filtra pelo contrato selecionado
				if (contrato.trim()) {
					const cod = String(r.codigo ?? "").trim();
					if (cod !== contrato.trim()) return false;
				}
				// Busca por texto (nome)
				if (search.trim()) {
					const s = search.trim().toLowerCase();
					const nome = String(r.nome ?? "").toLowerCase();
					const cod = String(r.codigo ?? "").toLowerCase();
					if (!nome.includes(s) && !cod.includes(s)) return false;
				}
				return true;
			})
			.map((r) => {
				const seq = Number(r.seq ?? 0);
				const grau = String(r.grau ?? "").trim();
				const codigo = String(r.codigo ?? "").trim();
				return {
					codigofal: codigo.padEnd(9, " ") + grau + String(seq).padStart(2, "0"),
					codigo,
					grau,
					seq,
					nome: String(r.nome ?? "").trimEnd(),
					nascto_: (r.nascto_ as Date | null) ?? null,
					vivofalec: String(r.vivofalec ?? "V").trim(),
					ehtitular: String(r.ehtitular ?? "").trim(),
				};
			});
	}, [getTable, contrato, search]);

	const visible = useMemo(
		() => filtered.slice(0, visibleCount),
		[filtered, visibleCount],
	);

	const hasMore = visibleCount < filtered.length;

	const handleScroll = useCallback(() => {
		const el = listRef.current;
		if (!el || !hasMore) return;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
			setVisibleCount((prev) => prev + PAGE_SIZE);
		}
	}, [hasMore]);

	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [search, open]);

	useEffect(() => {
		if (open) {
			setTimeout(() => searchRef.current?.focus(), 80);
		} else {
			setSearch("");
		}
	}, [open]);

	function handleSelect(f: FalecidoResumido) {
		onSelect(f);
		setOpen(false);
	}

	const canOpen = !disabled && contrato.trim() !== "";

	return (
		<>
			<div className="flex flex-col gap-0.5">
				{nomeFalecido && (
					<span className="text-sm text-gray-700 truncate font-medium">
						{nomeFalecido}
					</span>
				)}
				{label && (
					<label className="text-sm font-medium text-gray-700">
						{label}
						{required && <span className="text-red-500 ml-0.5">*</span>}
					</label>
				)}
				<div className="flex gap-1 items-center">
					<input
						readOnly
						value={value ?? ""}
						placeholder="Selecione o contrato primeiro"
						disabled={disabled}
						className="border border-gray-300 rounded px-2 py-1 text-sm w-40 bg-white disabled:bg-gray-100 font-mono text-xs"
					/>
					<button
						type="button"
						onClick={() => canOpen && setOpen(true)}
						disabled={!canOpen}
						title={
							contrato.trim()
								? "Buscar inscrito"
								: "Selecione um contrato primeiro"
						}
						className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					>
						🔍
					</button>
				</div>
			</div>

			<Modal
				isOpen={open}
				onClose={() => setOpen(false)}
				title={`Inscritos do Contrato ${contrato.trim()}`}
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
					<input
						ref={searchRef}
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por nome..."
						className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					<div className="grid grid-cols-[30px_1fr_90px_50px_65px] gap-2 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-gray-500 uppercase">
						<span>Grau</span>
						<span>Nome</span>
						<span>Dt. Nasc.</span>
						<span className="text-center">Tit.</span>
						<span className="text-center">Status</span>
					</div>

					<div
						ref={listRef}
						onScroll={handleScroll}
						className="overflow-y-auto border border-gray-200 rounded"
						style={{ maxHeight: 320 }}
					>
						{visible.length === 0 ? (
							<div className="text-center text-sm text-gray-400 py-8">
								{contrato.trim()
									? "Nenhum inscrito encontrado neste contrato."
									: "Selecione um contrato primeiro."}
							</div>
						) : (
							<>
								{visible.map((f, i) => (
									<div
										key={f.codigofal + i}
										onClick={() => handleSelect(f)}
										className="grid grid-cols-[30px_1fr_90px_50px_65px] gap-2 px-2 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm"
									>
										<span className="text-xs font-mono text-gray-600 self-center">
											{f.grau}
										</span>
										<span className="font-medium truncate self-center">
											{f.nome}
										</span>
										<span className="text-gray-500 text-xs self-center">
											{formatDate(f.nascto_) || "—"}
										</span>
										<span className="text-xs text-center self-center">
											{f.ehtitular === "S" || f.ehtitular === "T" ? (
												<span className="bg-blue-100 text-blue-700 px-1 rounded font-bold">
													Tit.
												</span>
											) : (
												<span className="text-gray-400">Dep.</span>
											)}
										</span>
										<span
											className={`text-xs font-bold text-center self-center px-1 rounded ${
												f.vivofalec === "F"
													? "bg-red-100 text-red-700"
													: "bg-green-100 text-green-700"
											}`}
										>
											{f.vivofalec === "F" ? "Falec." : "Vivo"}
										</span>
									</div>
								))}
								{hasMore && (
									<div className="text-center text-xs text-gray-400 py-2 border-t border-gray-100">
										Role para ver mais ({filtered.length - visibleCount}{" "}
										restantes)
									</div>
								)}
							</>
						)}
					</div>

					<p className="text-xs text-gray-400">
						{filtered.length} inscrito(s) neste contrato
					</p>
				</div>
			</Modal>
		</>
	);
}
