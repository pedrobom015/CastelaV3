import { useState } from "react";
import { formatCurrency } from "../../../utils/formatters";
import type { Grupo } from "../../../types/models";
import type { FichaDataType } from "./FichaFinanceira";

interface MensalidadeProps {
	fichaData: FichaDataType;
	form: Grupo;
	setField: (field: keyof Grupo, value: unknown) => void;
	readOnly: boolean;
	primary: string;
	grupoOpts: { value: string; label: string }[];
	categoriaOpts: { value: string; label: string }[];
}

export function Mensalidade({
	fichaData,
	form,
	setField,
	readOnly,
	grupoOpts,
	categoriaOpts,
}: MensalidadeProps) {
	const [editingGrupo, setEditingGrupo] = useState(false);
	const [editingCategoria, setEditingCategoria] = useState(false);

	return (
		<div className="rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
			<div className="bg-gray-50 border-b border-gray-200 text-xs">
				{/* Título */}
				<div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100">
					<div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
						{fichaData.prior === "S"
							? "Mensalidade VIP"
							: "Mensalidade / Circular"}
					</div>
					<div className="text-[10px] text-gray-400">
						CIRCULAR + CLASSES
					</div>
				</div>
				{/* Grupo + Categoria editáveis */}
				<div className="grid grid-cols-2 divide-x divide-gray-100">
					{/* Grupo */}
					<div
						className="flex flex-col px-3 py-1 gap-0.5 cursor-pointer"
						onClick={() => !readOnly && setEditingGrupo(true)}
					>
						<span className="text-[10px] text-gray-400">Grupo</span>
						{editingGrupo && !readOnly ? (
							<select
								autoFocus
								className="text-xs border border-blue-300 rounded px-1 py-0.5 bg-white text-gray-800 w-full"
								value={form.grupo ?? ""}
								onChange={(e) => {
									setField("grupo", e.target.value);
									setEditingGrupo(false);
								}}
								onBlur={() => setEditingGrupo(false)}
							>
								{grupoOpts.map((o) => (
									<option key={o.value} value={o.value}>
										{o.label}
									</option>
								))}
							</select>
						) : (
							<span
								className="font-medium text-gray-800 truncate"
								title={
									grupoOpts.find(
										(o) => o.value === form.grupo,
									)?.label
								}
							>
								{grupoOpts.find((o) => o.value === form.grupo)
									?.label ||
									form.grupo ||
									"—"}
							</span>
						)}
					</div>
					{/* Categoria */}
					<div
						className="flex flex-col px-3 py-1 gap-0.5 cursor-pointer"
						onClick={() =>
							!readOnly &&
							!editingCategoria &&
							setEditingCategoria(true)
						}
					>
						<span className="text-[10px] text-gray-400">
							Categoria
						</span>
						{editingCategoria && !readOnly ? (
							<div
								className="flex items-center gap-1"
								onClick={(e) => e.stopPropagation()}
							>
								<select
									autoFocus
									className="flex-1 text-xs border border-blue-300 rounded px-1 py-0.5 bg-white text-gray-800"
									value={form.tipcont ?? ""}
									onChange={(e) => {
										setField("tipcont", e.target.value);
										setEditingCategoria(false);
									}}
									onBlur={() => setEditingCategoria(false)}
								>
									{categoriaOpts.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
								{form.tipcont && (
									<button
										type="button"
										onMouseDown={() => {
											setField("tipcont", "");
											setEditingCategoria(false);
										}}
										className="text-gray-400 hover:text-red-500 px-1 shrink-0"
									>
										&times;
									</button>
								)}
							</div>
						) : (
							<div className="flex items-center gap-1 min-w-0">
								<span
									className="font-medium text-gray-800 truncate"
									title={
										categoriaOpts.find(
											(o) => o.value === form.tipcont,
										)?.label
									}
								>
									{categoriaOpts.find(
										(o) => o.value === form.tipcont,
									)?.label ||
										form.tipcont || (
											<span className="text-gray-400 italic font-normal">
												Sem categoria
											</span>
										)}
								</span>
								{!readOnly && form.tipcont && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setField("tipcont", "");
										}}
										className="text-gray-300 hover:text-red-500 leading-none shrink-0"
									>
										&times;
									</button>
								)}
							</div>
						)}
					</div>
				</div>
				{/* Informações derivadas */}
				<div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
					{(
						[
							[
								"Últ. Circular",
								fichaData.ultimaCirc
									? `#${fichaData.ultimaCirc.circ}`
									: "—",
							],
							[
								"Tipo",
								fichaData.prior === "S" ? "VIP" : "Padrão",
							],
							[
								"Periodicidade",
								fichaData.mforma === 1
									? "Mensal"
									: fichaData.mforma === 2
										? "Bimestral"
										: fichaData.mforma === 3
											? "Trimestral"
											: fichaData.mforma === 6
												? "Semestral"
												: fichaData.mforma === 12
													? "Anual"
													: `${fichaData.mforma} meses`,
							],
							["Dependentes", String(fichaData.nrdepend)],
						] as [string, string][]
					).map(([label, value]) => (
						<div key={label} className="flex flex-col px-3 py-1">
							<span className="text-[10px] text-gray-400">
								{label}
							</span>
							<span
								className="font-medium text-gray-700 truncate"
								title={value}
							>
								{value}
							</span>
						</div>
					))}
				</div>
			</div>
			<div className="divide-y divide-gray-100 flex-1">
				<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
					<div>
						<div className="font-medium text-gray-800">
							Valor Circular
						</div>
						<div className="text-gray-400">
							{fichaData.ultimaCirc
								? `#${fichaData.ultimaCirc.circ} `
								: "sem circular"}
						</div>
					</div>
					<div className="font-mono font-medium text-gray-700 shrink-0">
						{formatCurrency(fichaData.rvlaux)}
					</div>
				</div>
				<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
					<div>
						<div className="font-medium text-gray-800">
							Adicional da categoria
						</div>
						<div className="text-gray-400">
							{fichaData.usouFallback
								? "Grupo"
								: `Cat. ${fichaData.classeEfetiva}`}
							{fichaData.vlmensal < 0 ? " · desc." : ""}
						</div>
					</div>
					<div
						className={`font-mono font-medium shrink-0 ${fichaData.vlmensal < 0 ? "text-red-600" : "text-gray-700"}`}
					>
						{formatCurrency(fichaData.vlmensal)}
					</div>
				</div>
				{fichaData.nrdepend > 0 && (
					<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
						<div>
							<div className="font-medium text-gray-800">
								Adicional por dependentes
							</div>
							<div className="text-gray-400">
								{fichaData.nrdepend} ×{" "}
								{formatCurrency(fichaData.vldepend)} ·
							</div>
						</div>
						<div className="font-mono font-medium text-gray-700 shrink-0">
							{formatCurrency(
								fichaData.nrdepend * fichaData.vldepend,
							)}
						</div>
					</div>
				)}
				{fichaData.prior === "S" && fichaData.mforma > 1 && (
					<div className="flex justify-between items-center px-3 py-1 text-[10px] bg-gray-50/60 text-gray-500 gap-2">
						<span>
							Base × {fichaData.mforma} (VIP · GRUPOS.formapgto
							{fichaData.mgrupvipUsado
								? ` · circ. grupo ${fichaData.mgrupvipUsado}`
								: ""}
							)
						</span>
						<span className="font-mono shrink-0">
							{formatCurrency(fichaData.baseMensal)} ×{" "}
							{fichaData.mforma}
						</span>
					</div>
				)}
			</div>
			<div className="flex justify-between items-center px-3 py-1.5 bg-blue-50 border-t border-blue-100">
				<div className="text-xs font-semibold text-blue-900">
					{fichaData.prior === "S"
						? `Total p/ período`
						: "Total para mensalidade"}
				</div>
				<div className="font-mono font-bold text-blue-900 text-sm">
					{formatCurrency(fichaData.valorMensalidade)}
				</div>
			</div>
		</div>
	);
}
