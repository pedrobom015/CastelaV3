/**
 * TcarnesInput — campo de seleção de tipo de carnê com lupinha
 * Referencia a tabela TCARNES.DBF (tip, tipcob, formapgto, pari, vali, parf).
 * Equivalente ao VDBF(...,'TCARNES',...) do legado (DEFINICAO 19 em GRUPOS).
 *
 * Campos TCARNES (conforme TCARNES.PRG):
 *   tip      — Tipo (código sequencial, 2 chars)
 *   tipcob   — Gerar cobrança tipo (M=Mensal, B=Bimestral, T=Trimestral, S=Semestral, A=Anual)
 *   formapgto— Forma de Pagamento
 *   pari     — Parcela inicial
 *   vali     — Valor Total
 *   parf     — Nº de Parcelas
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { Modal } from "../../../components/common/Modal";
import { useAppStore } from "../../../store/appStore";
import { formatCurrency } from "../../../utils/formatters";

const TIPCOB_LABEL: Record<string, string> = {
	M: "M - Mensal",
	B: "B - Bimestral",
	T: "T - Trimestral",
	S: "S - Semestral",
	A: "A - Anual",
};

const FORMAPGTO_LABEL: Record<string, string> = {
	"01": "01 - Mensalidade",
	"02": "02 - Carnê",
	"03": "03 - Débito Automático",
	"04": "04 - Boleto",
	"05": "05 - Cartão",
};

interface TcarnesRec {
	tip: string;
	tipcob: string;
	formapgto: string;
	pari: number;
	vali: number;
	parf: number;
	parm?: number;
	_deleted?: boolean;
}

interface TcarnesInputProps {
	value: string;
	label?: string;
	disabled?: boolean;
	onSelect: (tip: string, rec?: TcarnesRec) => void;
	// Modo controlado: esconde o trigger e usa isOpen externo
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function TcarnesInput({
	value,
	label = "Tip. Carnê",
	disabled,
	onSelect,
	isOpen: isOpenProp,
	onOpenChange,
}: TcarnesInputProps) {
	const { getTable } = useAppStore();
	const controlled = isOpenProp !== undefined;
	const [openInternal, setOpenInternal] = useState(false);
	const open = controlled ? isOpenProp : openInternal;
	const [search, setSearch] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);

	function setOpen(v: boolean) {
		if (controlled) onOpenChange?.(v);
		else setOpenInternal(v);
	}

	const records = useMemo<TcarnesRec[]>(() => {
		const table = getTable("tcarnes");
		if (!table) return [];
		const all = (table.records as unknown as TcarnesRec[]).filter(
			(r) => !r._deleted,
		);
		if (!search.trim()) return all;
		const s = search.toLowerCase();
		return all.filter(
			(r) =>
				String(r.tip).toLowerCase().includes(s) ||
				String(r.tipcob).toLowerCase().includes(s) ||
				(TIPCOB_LABEL[r.tipcob] ?? "").toLowerCase().includes(s),
		);
	}, [getTable, search, open]);

	const selected = useMemo<TcarnesRec | undefined>(() => {
		const table = getTable("tcarnes");
		if (!table || !value) return undefined;
		return (table.records as unknown as TcarnesRec[]).find(
			(r) => String(r.tip).trim() === String(value).trim(),
		);
	}, [getTable, value]);

	useEffect(() => {
		if (open) {
			setTimeout(() => searchRef.current?.focus(), 80);
		} else {
			setSearch("");
		}
	}, [open]);

	function handleSelect(rec: TcarnesRec) {
		onSelect(String(rec.tip).trim(), rec);
		setOpen(false);
	}

	return (
		<>
			{!controlled && (
			<div className="flex flex-col gap-0.5">
				{label && (
					<label className="text-sm font-medium text-gray-700">
						{label}
					</label>
				)}
				<div className="flex gap-1 items-center">
					<input
						readOnly
						value={value || ""}
						placeholder="—"
						disabled={disabled}
						className="border border-gray-300 rounded px-2 py-1 text-sm w-14 bg-white disabled:bg-gray-100 font-mono text-center"
					/>
					<button
						type="button"
						onClick={() => !disabled && setOpen(true)}
						disabled={disabled}
						title="Consultar tabela de carnês (TCARNES)"
						className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						🔍
					</button>
					{value && !disabled && (
						<button
							type="button"
							onClick={() => onSelect("", undefined)}
							title="Limpar tipo de carnê"
							className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
						>
							×
						</button>
					)}
					{selected && (
						<span className="text-xs text-gray-500 self-center truncate max-w-[160px]">
							{TIPCOB_LABEL[selected.tipcob] ?? selected.tipcob}
							{selected.vali > 0 && ` · ${formatCurrency(selected.vali)}`}
						</span>
					)}
				</div>
			</div>
			)}

			<Modal
				isOpen={open}
				onClose={() => setOpen(false)}
				title="Tabela de Carnês — TCARNES"
				size="md"
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
				<div className="flex flex-col gap-3">
					<input
						ref={searchRef}
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por tipo ou periodicidade..."
						className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					<div className="border border-gray-200 rounded overflow-hidden">
						{/* Cabeçalho */}
						<div className="grid grid-cols-[36px_1fr_1fr_88px] gap-x-2 px-2 py-1.5 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
							<span>Tipo</span>
							<span>Tipo Cobrança</span>
							<span>Forma de Pagamento</span>
							<span className="text-right">Valor Total</span>
						</div>

						{/* Linhas */}
						<div className="overflow-y-auto" style={{ maxHeight: 280 }}>
							{records.length === 0 ? (
								<div className="text-center text-xs text-gray-400 py-8">
									{search
										? "Nenhum tipo encontrado."
										: "Nenhum tipo de carnê cadastrado."}
								</div>
							) : (
								records.map((r, i) => (
									<div
										key={r.tip + i}
										onClick={() => handleSelect(r)}
										className={`grid grid-cols-[36px_1fr_1fr_88px] gap-x-2 px-2 py-1.5 cursor-pointer border-b border-gray-100 last:border-0 text-xs hover:bg-blue-50 transition-colors ${
											String(r.tip).trim() === String(value).trim()
												? "bg-blue-50 font-semibold"
												: ""
										}`}
									>
										<span className="font-mono font-bold text-gray-700">
											{r.tip}
										</span>
										<span className="text-gray-700">
											{TIPCOB_LABEL[r.tipcob] ?? (r.tipcob || "—")}
										</span>
										<span className="text-gray-600">
											{FORMAPGTO_LABEL[r.formapgto] ?? (r.formapgto || "—")}
										</span>
										<span className="text-right text-gray-700 tabular-nums">
											{r.vali > 0 ? formatCurrency(r.vali) : "—"}
										</span>
									</div>
								))
							)}
						</div>
					</div>

					<p className="text-xs text-gray-400">
						{records.length} tipo(s) — clique para selecionar
					</p>
				</div>
			</Modal>
		</>
	);
}
