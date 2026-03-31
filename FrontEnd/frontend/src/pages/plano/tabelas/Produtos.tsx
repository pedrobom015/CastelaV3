import { Fragment, useState, useMemo } from "react";
import { useAppStore } from "../../../store/appStore";
import { useThemeStore } from "../../../store/themeStore";
import { Modal, ConfirmDialog } from "../../../components/common/Modal";
import {
	PageHeader,
	Btn,
	SearchBar,
} from "../../../components/common/PageHeader";
import {
	FormInput,
	FormSection,
	FormRow,
} from "../../../components/common/FormField";
import { formatCurrency } from "../../../utils/formatters";
import { searchRecords } from "../../../utils/dbfHelpers";
import type { DbfRecord } from "../../../types/models";
import { writeDbfFile } from "../../../services/dbf/DbfReader";

type ProdRec = DbfRecord & {
	codigo: string;
	produto: string;
	unid: string;
	grupo: string;
	depto: string;
	qd_est: number;
	preco_cus: number;
	preco_ven: number;
};

function emptyRec(): ProdRec {
	return {
		codigo: "",
		produto: "",
		unid: "",
		grupo: "",
		depto: "",
		qd_est: 0,
		preco_cus: 0,
		preco_ven: 0,
	};
}

export function Produtos() {
	const { getTable, setTable, dirHandle } = useAppStore();
	const [search, setSearch] = useState("");
	const [expandedProd, setExpandedProd] = useState<string | null>(null);
	const [highlightedProd, setHighlightedProd] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<ProdRec | null>(null);
	const [form, setForm] = useState<ProdRec>(emptyRec());
	const [confirmDelete, setConfirmDelete] = useState<ProdRec | null>(null);
	const [saving, setSaving] = useState(false);

	const _theme = useThemeStore((s) => s.theme);
	const primary =
		_theme === "orange"
			? "#ff914d"
			: _theme === "gray"
				? "#248094"
				: "#1e3a8a";

	const table = getTable("pradendo");
	const adendosTable = getTable("adendos");

	const records = useMemo(() => {
		return searchRecords(table, search, [
			"codigo",
			"produto",
			"grupo",
			"depto",
		]) as ProdRec[];
	}, [table, search]);

	// Conta famílias ativas por produto (adendos não excluídos)
	const familiasPorProduto = useMemo(() => {
		const map = new Map<string, number>();
		(adendosTable?.records ?? []).forEach((r) => {
			if (r._deleted || String(r.flag_excl ?? "").trim() === "*") return;
			const cod = String(r.codproduto ?? "").trim();
			if (cod) map.set(cod, (map.get(cod) ?? 0) + 1);
		});
		return map;
	}, [adendosTable]);

	function handleNew() {
		setEditing(null);
		setForm(emptyRec());
		setModalOpen(true);
	}

	function handleEdit(record: ProdRec) {
		setEditing(record);
		setForm({ ...record });
		setModalOpen(true);
	}

	async function handleDelete() {
		if (!confirmDelete || !table || !dirHandle) return;
		const updated = table.records.filter((r) => r !== confirmDelete);
		const newTable = { ...table, records: updated };
		setTable("pradendo", newTable);
		await writeDbfFile(dirHandle, "PRADENDO.DBF", newTable);
		setConfirmDelete(null);
	}

	async function handleSave() {
		if (!dirHandle) return;
		setSaving(true);
		try {
			const currentTable = getTable("pradendo");
			const newRec: ProdRec = { ...form };
			let updatedRecords: DbfRecord[];
			if (editing) {
				updatedRecords = (currentTable?.records ?? []).map((r) =>
					r === editing ? newRec : r,
				);
			} else {
				updatedRecords = [...(currentTable?.records ?? []), newRec];
			}
			const newTable = currentTable
				? { ...currentTable, records: updatedRecords }
				: {
						header: {
							version: 3,
							lastUpdate: new Date(),
							recordCount: updatedRecords.length,
							headerSize: 0,
							recordSize: 0,
							fields: [],
						},
						records: updatedRecords,
					};
			setTable("pradendo", newTable);
			await writeDbfFile(dirHandle, "PRADENDO.DBF", newTable);
			setModalOpen(false);
			setHighlightedProd(String(newRec.codigo).trim());
			setTimeout(() => setHighlightedProd(null), 3000);
		} finally {
			setSaving(false);
		}
	}

	function set(field: keyof ProdRec, value: string | number) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	return (
		<div className="p-4">
			<PageHeader
				title="Produtos & Serviços"
				subtitle="PRADENDO.DBF — Cadastro de produtos e serviços"
				actions={
					<>
						<SearchBar
							value={search}
							onChange={setSearch}
							placeholder="Buscar por código, produto, grupo..."
						/>
						<Btn
							variant="secondary"
							icon="✏️"
							disabled={!expandedProd}
							onClick={() => {
								const selRec = records.find(
									(r) =>
										String(r.codigo).trim() ===
										expandedProd,
								);
								if (selRec) handleEdit(selRec);
							}}
						>
							Editar
						</Btn>
						<Btn
							icon="+"
							onClick={handleNew}
							style={{
								backgroundColor: primary,
								borderColor: primary,
							}}
						>
							Incluir
						</Btn>
					</>
				}
			/>

			<div className="mb-3 text-sm text-gray-500">
				{records.length} produto(s)
			</div>

			{records.length === 0 ? (
				<p className="text-center py-10 text-gray-400 text-sm italic">
					Nenhum produto encontrado.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{records.map((rec) => {
						const cod = String(rec.codigo ?? "").trim();
						const familias = familiasPorProduto.get(cod) ?? 0;
						const isSelected = expandedProd === cod;
						const isHighlighted = highlightedProd === cod;

						return (
							<Fragment key={cod || String(rec.produto)}>
								<div
									className="rounded-xl border text-xs select-none transition-all duration-200 overflow-hidden cursor-pointer"
									style={{
										borderColor: isHighlighted
											? "#86efac"
											: isSelected
												? primary
												: "#e5e7eb",
										boxShadow: isHighlighted
											? "0 0 0 2px #86efac"
											: isSelected
												? `0 0 0 2px ${primary}33`
												: "0 1px 3px rgba(0,0,0,0.06)",
										background: isHighlighted
											? "#dcfce7"
											: "#fff",
									}}
									onClick={() =>
										setExpandedProd(
											isSelected ? null : cod,
										)
									}
									onDoubleClick={(e) => {
										e.stopPropagation();
										handleEdit(rec);
									}}
								>
									{/* Cabeçalho */}
									<div
										className="flex items-center gap-2 min-w-0 px-3 py-2 border-b"
										style={{
											borderColor: isSelected
												? `${primary}33`
												: "#f3f4f6",
											background: isSelected
												? `${primary}0d`
												: undefined,
										}}
									>
										<span
											className="font-mono font-bold text-sm shrink-0"
											style={{ color: primary }}
										>
											{cod}
										</span>
										<span className="font-semibold text-xs text-gray-800 truncate flex-1">
											{String(rec.produto ?? "").trim() ||
												"—"}
										</span>
										<svg
											className="w-3.5 h-3.5 shrink-0 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											onClick={(e) => {
												e.stopPropagation();
												handleEdit(rec);
											}}
										>
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									</div>

									{/* Estatísticas */}
									<div className="grid grid-cols-2 gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-gray-600">
										<div className="flex justify-between">
											<span className="text-gray-400">
												Famílias
											</span>
											<span className="font-medium text-gray-700">
												{familias > 0 ? (
													familias
												) : (
													<span className="text-gray-300">
														—
													</span>
												)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">
												Preço Venda
											</span>
											<span
												className="font-semibold"
												style={{ color: primary }}
											>
												{rec.preco_ven ? (
													formatCurrency(
														Number(rec.preco_ven),
													)
												) : (
													<span className="text-gray-300 font-normal">
														—
													</span>
												)}
											</span>
										</div>
										{rec.preco_cus > 0 && rec.preco_ven > 0 && (
											<>
												<div className="flex justify-between">
													<span className="text-gray-400">
														Preço Custo
													</span>
													<span className="font-medium text-gray-700">
														{formatCurrency(
															Number(rec.preco_cus),
														)}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-400">
														Margem
													</span>
													<span className="font-medium text-gray-700">
														{(
															((rec.preco_ven -
																rec.preco_cus) /
																rec.preco_cus) *
															100
														).toFixed(1)}
														%
													</span>
												</div>
											</>
										)}
									</div>
								</div>
							</Fragment>
						);
					})}
				</div>
			)}

			<Modal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				title={editing ? "Editar Produto" : "Novo Produto"}
				size="lg"
				footer={
					<>
						<Btn
							variant="secondary"
							onClick={() => setModalOpen(false)}
						>
							Cancelar
						</Btn>
						<Btn onClick={handleSave} disabled={saving}>
							{saving ? "Salvando..." : "Salvar"}
						</Btn>
					</>
				}
			>
				<FormSection title="Identificação">
					<FormRow cols={2}>
						<FormInput
							label="Código (4 car.)"
							value={form.codigo}
							onChange={(e) => set("codigo", e.target.value)}
							maxLength={4}
							required
						/>
						<FormInput
							label="Unidade"
							value={form.unid}
							onChange={(e) => set("unid", e.target.value)}
							maxLength={2}
							placeholder="UN, KG, CX..."
						/>
					</FormRow>
					<FormInput
						label="Nome do Produto"
						value={form.produto}
						onChange={(e) => set("produto", e.target.value)}
						maxLength={30}
						required
					/>
					<FormRow cols={2}>
						<FormInput
							label="Grupo"
							value={form.grupo}
							onChange={(e) => set("grupo", e.target.value)}
							maxLength={10}
						/>
						<FormInput
							label="Departamento"
							value={form.depto}
							onChange={(e) => set("depto", e.target.value)}
							maxLength={10}
						/>
					</FormRow>
				</FormSection>
				<FormSection title="Estoque e Preços">
					<FormRow cols={3}>
						<FormInput
							label="Qtd. Estoque"
							type="number"
							value={String(form.qd_est)}
							onChange={(e) =>
								set("qd_est", parseInt(e.target.value) || 0)
							}
						/>
						<FormInput
							label="Preço Custo"
							type="number"
							step="0.01"
							value={String(form.preco_cus)}
							onChange={(e) =>
								set(
									"preco_cus",
									parseFloat(e.target.value) || 0,
								)
							}
						/>
						<FormInput
							label="Preço Venda"
							type="number"
							step="0.01"
							value={String(form.preco_ven)}
							onChange={(e) =>
								set(
									"preco_ven",
									parseFloat(e.target.value) || 0,
								)
							}
						/>
					</FormRow>
					{form.preco_cus > 0 && form.preco_ven > 0 && (
						<div className="text-sm text-green-700 bg-green-50 rounded p-2">
							Margem:{" "}
							{(
								((form.preco_ven - form.preco_cus) /
									form.preco_cus) *
								100
							).toFixed(2)}
							%
						</div>
					)}
				</FormSection>
			</Modal>

			<ConfirmDialog
				isOpen={!!confirmDelete}
				onConfirm={handleDelete}
				onCancel={() => setConfirmDelete(null)}
				title="Confirmar Exclusão"
				message={`Deseja excluir o produto "${confirmDelete?.produto}"?`}
			/>
		</div>
	);
}
