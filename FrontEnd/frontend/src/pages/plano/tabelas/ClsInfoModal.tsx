/**
 * ClsInfoModal — edita a camada de apresentação de uma categoria.
 * Grava em CLSINFO.DBF (1 registro por classe) e CLSITEM.DBF (N itens).
 */

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../../store/appStore";
import { Modal } from "../../../components/common/Modal";
import { Btn } from "../../../components/common/PageHeader";
import {
	FormInput,
	FormSection,
	FormRow,
	FormTextarea,
} from "../../../components/common/FormField";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import type { DbfRecord } from "../../../types/models";
import type { DbfField } from "../../../services/dbf/DbfReader";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ClsInfoRec = DbfRecord & {
	classcod: string;
	subtitulo: string;
	descricao: string;
	cobertura: string;
	preco_exib: number;
	url_contrat: string;
	url_saiba: string;
	ordem: number;
	destaque: boolean;
};

export type ClsItemRec = DbfRecord & {
	classcod: string;
	ordem: number;
	descricao: string;
	status: string; // I=incluído  O=opcional  N=não incluído
};

// ─── Schemas DBF (usados ao criar os arquivos do zero) ─────────────────────────

export const CLSINFO_FIELDS: DbfField[] = [
	{ name: "classcod", type: "C", length: 4, decimals: 0 },
	{ name: "subtitulo", type: "C", length: 80, decimals: 0 },
	{ name: "descricao", type: "C", length: 254, decimals: 0 },
	{ name: "cobertura", type: "C", length: 200, decimals: 0 },
	{ name: "preco_exib", type: "N", length: 8, decimals: 2 },
	{ name: "url_contrat", type: "C", length: 100, decimals: 0 },
	{ name: "url_saiba", type: "C", length: 100, decimals: 0 },
	{ name: "ordem", type: "N", length: 3, decimals: 0 },
	{ name: "destaque", type: "L", length: 1, decimals: 0 },
];

export const CLSITEM_FIELDS: DbfField[] = [
	{ name: "classcod", type: "C", length: 4, decimals: 0 },
	{ name: "ordem", type: "N", length: 3, decimals: 0 },
	{ name: "descricao", type: "C", length: 100, decimals: 0 },
	{ name: "status", type: "C", length: 1, decimals: 0 },
];

// ─── Factories ────────────────────────────────────────────────────────────────

function emptyInfo(classcod: string): ClsInfoRec {
	return {
		classcod,
		subtitulo: "",
		descricao: "",
		cobertura: "",
		preco_exib: 0,
		url_contrat: "",
		url_saiba: "",
		ordem: 0,
		destaque: false,
	};
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
	isOpen: boolean;
	onClose: () => void;
	classcod: string;
	descricao: string;
	primary: string;
}

export function ClsInfoModal({
	isOpen,
	onClose,
	classcod,
	descricao,
	primary,
}: Props) {
	const { getTable, setTable, dirHandle } = useAppStore();
	const [tab, setTab] = useState<"info" | "itens">("info");
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState<ClsInfoRec>(emptyInfo(classcod));
	const [items, setItems] = useState<ClsItemRec[]>([]);

	// ── Dados das tabelas ──────────────────────────────────────────────────────

	const existingInfo = useMemo(() => {
		const clsInfoTable = getTable("clsinfo");
		return (
			((clsInfoTable?.records ?? []).find(
				(r) => String(r.classcod ?? "").trim() === classcod,
			) as ClsInfoRec | undefined) ?? emptyInfo(classcod)
		);
	}, [getTable, classcod]);

	const existingItems = useMemo(() => {
		const clsItemTable = getTable("clsitem");
		return (clsItemTable?.records ?? [])
			.filter((r) => String(r.classcod ?? "").trim() === classcod)
			.sort((a, b) => Number(a.ordem) - Number(b.ordem)) as ClsItemRec[];
	}, [getTable, classcod]);

	// Sincroniza estado local ao abrir o modal
	useEffect(() => {
		if (isOpen) {
			setForm({ ...existingInfo });
			setItems(existingItems.map((it) => ({ ...it })));
			setTab("info");
		}
	}, [isOpen, classcod]); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Handlers ──────────────────────────────────────────────────────────────

	function setF(field: keyof ClsInfoRec, value: string | number | boolean) {
		setForm((p) => ({ ...p, [field]: value }));
	}

	function addItem() {
		const nextOrdem =
			items.length > 0
				? Math.max(...items.map((i) => Number(i.ordem))) + 1
				: 1;
		setItems((p) => [
			...p,
			{ classcod, ordem: nextOrdem, descricao: "", status: "I" },
		]);
	}

	function removeItem(idx: number) {
		setItems((p) => p.filter((_, i) => i !== idx));
	}

	function updateItem(
		idx: number,
		field: keyof ClsItemRec,
		value: string | number,
	) {
		setItems((p) =>
			p.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
		);
	}

	function moveItem(idx: number, dir: -1 | 1) {
		const next = idx + dir;
		if (next < 0 || next >= items.length) return;
		setItems((p) => {
			const arr = [...p];
			[arr[idx], arr[next]] = [arr[next], arr[idx]];
			return arr.map((it, i) => ({ ...it, ordem: i + 1 }));
		});
	}

	async function handleSave() {
		if (!dirHandle) return;
		setSaving(true);
		try {
			// ── CLSINFO ──────────────────────────────────────────────────────
			const curInfo = getTable("clsinfo");
			const newInfoRec: ClsInfoRec = { ...form, classcod };
			const infoRows = curInfo
				? curInfo.records.some(
						(r) => String(r.classcod ?? "").trim() === classcod,
					)
					? curInfo.records.map((r) =>
							String(r.classcod ?? "").trim() === classcod
								? newInfoRec
								: r,
						)
					: [...curInfo.records, newInfoRec]
				: [newInfoRec];

			const infoTable = curInfo
				? { ...curInfo, records: infoRows }
				: {
						header: {
							version: 3,
							lastUpdate: new Date(),
							recordCount: infoRows.length,
							headerSize: 0,
							recordSize: 0,
							fields: CLSINFO_FIELDS,
						},
						records: infoRows,
					};
			setTable("clsinfo", infoTable);
			await writeDbfFile(dirHandle, "CLSINFO.DBF", infoTable);

			// ── CLSITEM ──────────────────────────────────────────────────────
			const curItems = getTable("clsitem");
			const reordered = items.map((it, i) => ({
				...it,
				classcod,
				ordem: i + 1,
			}));
			const otherItems = (curItems?.records ?? []).filter(
				(r) => String(r.classcod ?? "").trim() !== classcod,
			);
			const itemRows = [...otherItems, ...reordered];
			const itemTable = curItems
				? { ...curItems, records: itemRows }
				: {
						header: {
							version: 3,
							lastUpdate: new Date(),
							recordCount: itemRows.length,
							headerSize: 0,
							recordSize: 0,
							fields: CLSITEM_FIELDS,
						},
						records: itemRows,
					};
			setTable("clsitem", itemTable);
			await writeDbfFile(dirHandle, "CLSITEM.DBF", itemTable);

			onClose();
		} finally {
			setSaving(false);
		}
	}

	const STATUS_OPTS = [
		{ value: "I", label: "✓ Incluído" },
		{ value: "O", label: "Opcional" },
		{ value: "N", label: "✗ Não incluído" },
	];

	const STATUS_COLORS: Record<string, string> = {
		I: "text-green-700 bg-green-50",
		O: "text-yellow-700 bg-yellow-50",
		N: "text-gray-400 bg-gray-50",
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Plano — ${classcod} · ${descricao}`}
			size="lg"
			footer={
				<>
					<Btn variant="secondary" onClick={onClose}>
						Cancelar
					</Btn>
					<Btn
						onClick={handleSave}
						disabled={saving}
						style={{
							backgroundColor: primary,
							borderColor: primary,
						}}
					>
						{saving ? "Salvando..." : "Salvar"}
					</Btn>
				</>
			}
		>
			{/* ── Tabs ──────────────────────────────────────────────────────── */}
			<div className="flex gap-1 mb-4 border-b border-gray-200">
				{(["info", "itens"] as const).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
							tab === t
								? "border-current"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
						style={tab === t ? { color: primary } : undefined}
					>
						{t === "info" ? "Apresentação" : `Itens (${items.length})`}
					</button>
				))}
			</div>

			{/* ── Aba: Apresentação ─────────────────────────────────────────── */}
			{tab === "info" && (
				<div className="flex flex-col gap-3">
					<FormSection title="Identificação">
						<FormRow cols={2}>
							<FormInput
								label="Preço de Exibição (R$/mês)"
								type="number"
								step="0.01"
								value={String(form.preco_exib)}
								onChange={(e) =>
									setF(
										"preco_exib",
										parseFloat(e.target.value) || 0,
									)
								}
								placeholder="89.90"
							/>
							<FormInput
								label="Ordem de Exibição"
								type="number"
								value={String(form.ordem)}
								onChange={(e) =>
									setF("ordem", parseInt(e.target.value) || 0)
								}
								placeholder="1"
							/>
						</FormRow>
						<FormInput
							label="Subtítulo"
							value={form.subtitulo}
							onChange={(e) => setF("subtitulo", e.target.value)}
							maxLength={80}
							placeholder="Ex: Plano individual a partir de R$19,90"
						/>
						<label className="flex items-center gap-2 cursor-pointer w-fit">
							<input
								type="checkbox"
								checked={!!form.destaque}
								onChange={(e) =>
									setF("destaque", e.target.checked)
								}
								className="w-4 h-4 rounded accent-blue-600"
							/>
							<span className="text-sm font-medium text-gray-700">
								Destaque (plano em evidência)
							</span>
						</label>
					</FormSection>

					<FormSection title="Descrição">
						<FormTextarea
							label="Descrição Longa"
							value={form.descricao}
							onChange={(e) => setF("descricao", e.target.value)}
							maxLength={254}
							rows={4}
							placeholder="Parágrafo de apresentação do plano..."
						/>
						<FormTextarea
							label="Cobertura / Público-alvo"
							value={form.cobertura}
							onChange={(e) => setF("cobertura", e.target.value)}
							maxLength={200}
							rows={2}
							placeholder="Ex: Titular e cônjuge (até 65 anos) + Filhos até 33 anos..."
						/>
					</FormSection>

					<FormSection title="Links">
						<FormInput
							label="URL — Contratar"
							value={form.url_contrat}
							onChange={(e) =>
								setF("url_contrat", e.target.value)
							}
							maxLength={100}
							placeholder="https://..."
						/>
						<FormInput
							label="URL — Saiba Mais"
							value={form.url_saiba}
							onChange={(e) => setF("url_saiba", e.target.value)}
							maxLength={100}
							placeholder="https://..."
						/>
					</FormSection>
				</div>
			)}

			{/* ── Aba: Itens ────────────────────────────────────────────────── */}
			{tab === "itens" && (
				<div className="flex flex-col gap-2">
					{items.length === 0 && (
						<p className="text-sm text-gray-400 italic text-center py-6">
							Nenhum item. Clique em "+ Adicionar item" para
							começar.
						</p>
					)}

					{items.map((it, idx) => (
						<div
							key={idx}
							className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
						>
							{/* Status */}
							<select
								value={it.status}
								onChange={(e) =>
									updateItem(idx, "status", e.target.value)
								}
								className={`border border-gray-300 rounded px-1.5 py-1 text-xs w-32 shrink-0 font-medium ${STATUS_COLORS[it.status] ?? ""}`}
							>
								{STATUS_OPTS.map((o) => (
									<option key={o.value} value={o.value}>
										{o.label}
									</option>
								))}
							</select>

							{/* Descrição */}
							<input
								type="text"
								value={it.descricao}
								onChange={(e) =>
									updateItem(
										idx,
										"descricao",
										e.target.value,
									)
								}
								maxLength={100}
								className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs min-w-0 bg-white"
								placeholder="Descrição do item..."
							/>

							{/* Mover */}
							<button
								onClick={() => moveItem(idx, -1)}
								disabled={idx === 0}
								className="text-gray-400 hover:text-gray-600 disabled:opacity-25 text-base leading-none px-0.5"
								title="Mover para cima"
							>
								↑
							</button>
							<button
								onClick={() => moveItem(idx, 1)}
								disabled={idx === items.length - 1}
								className="text-gray-400 hover:text-gray-600 disabled:opacity-25 text-base leading-none px-0.5"
								title="Mover para baixo"
							>
								↓
							</button>

							{/* Remover */}
							<button
								onClick={() => removeItem(idx)}
								className="text-red-400 hover:text-red-600 text-sm leading-none px-0.5 ml-1"
								title="Remover item"
							>
								✕
							</button>
						</div>
					))}

					<button
						onClick={addItem}
						className="mt-1 text-sm font-medium py-2.5 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-colors"
					>
						+ Adicionar item
					</button>
				</div>
			)}
		</Modal>
	);
}
