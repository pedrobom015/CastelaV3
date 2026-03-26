import { useState, useMemo } from "react";
import { useAppStore } from "../../../store/appStore";
import { DataTable, type Column } from "../../../components/common/DataTable";
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
import { formatDate, toDateInputValue } from "../../../utils/formatters";
import { getRecords, searchRecords, nextCode } from "../../../utils/dbfHelpers";
import type { DbfRecord } from "../../../types/models";
import { writeDbfFile } from "../../../services/dbf/DbfReader";

type CancelRec = DbfRecord & {
	cnumero: string;
	filial: string;
	ccodigo: string;
	cgrupo: string;
	cmotivo: string;
	lancto_: Date | null;
	por: string;
	procto_: Date | null;
};

function emptyRec(): CancelRec {
	return {
		cnumero: "",
		filial: "",
		ccodigo: "",
		cgrupo: "",
		cmotivo: "",
		lancto_: null,
		por: "",
		procto_: null,
	};
}

const COLUMNS: Column[] = [
	{ key: "cnumero", label: "Nº Cancel.", width: "100px" },
	{ key: "ccodigo", label: "Código", width: "80px" },
	{ key: "cgrupo", label: "Grupo", width: "60px", align: "center" },
	{ key: "cmotivo", label: "Motivo", width: "200px" },
	{
		key: "lancto_",
		label: "Lançamento",
		width: "110px",
		render: (v) => formatDate(v as Date),
	},
	{ key: "por", label: "Por", width: "100px" },
];

export function Cancelamentos() {
	const { getTable, setTable, dirHandle, usuario } = useAppStore();
	const [search, setSearch] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<CancelRec | null>(null);
	const [form, setForm] = useState<CancelRec>(emptyRec());
	const [confirmDelete, setConfirmDelete] = useState<CancelRec | null>(null);
	const [saving, setSaving] = useState(false);
	const isDirty = editing
		? JSON.stringify(form) !== JSON.stringify(editing)
		: form.ccodigo.trim() !== "";
	// No seu componente de Cancelados
	const [highlightedRecord, setHighlightedRecord] =
		useState<DbfRecord | null>(null);
	const table = getTable("cancels");

	const records = useMemo(() => {
		return searchRecords(table, search, [
			"cnumero",
			"ccodigo",
			"cmotivo",
		]) as CancelRec[];
	}, [table, search]);

	function handleNew() {
		const rec = emptyRec();
		rec.cnumero = nextCode(table, "cnumero", 6);
		rec.por = usuario;
		rec.lancto_ = new Date();
		setEditing(null);
		setForm(rec);
		setModalOpen(true);
	}

	function handleEdit(record: DbfRecord) {
		setEditing(record as CancelRec);
		setForm({ ...(record as CancelRec) });
		setModalOpen(true);
	}

	function handleDeleteRequest(record: DbfRecord) {
		setConfirmDelete(record as CancelRec);
	}

	async function handleDelete() {
		if (!confirmDelete || !table || !dirHandle) return;
		const updated = table.records.filter((r) => r !== confirmDelete);
		const newTable = { ...table, records: updated };
		setTable("cancels", newTable);
		await writeDbfFile(dirHandle, "CANCELS.DBF", newTable);
		setConfirmDelete(null);
	}

	async function handleSave() {
		if (!dirHandle) return;
		setSaving(true);
		try {
			const currentTable = getTable("cancels");
			const newRec: CancelRec = {
				...form,
				lancto_: form.lancto_ ?? new Date(),
				por: usuario || form.por,
			};

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

			setTable("cancels", newTable);
			await writeDbfFile(dirHandle, "CANCELS.DBF", newTable);

			// --- ADICIONE ESTAS LINHAS AQUI ---
			setHighlightedRecord(newRec); // Ativa o verde
			setTimeout(() => setHighlightedRecord(null), 3000); // Remove após 3s
			// ----------------------------------

			setModalOpen(false);
		} catch (e) {
			alert("Erro ao salvar: " + String(e));
		} finally {
			setSaving(false);
		}
	}

	function set(field: keyof CancelRec, value: string | Date | null) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	return (
		<div className="p-4">
			<PageHeader
				title="Cancelamentos"
				subtitle="CANCELS.DBF — Registro de cancelamentos de contratos"
				actions={
					<>
						<SearchBar
							value={search}
							onChange={setSearch}
							placeholder="Buscar por número, código, motivo..."
						/>
						<Btn icon="+" onClick={handleNew}>
							Incluir
						</Btn>
					</>
				}
			/>

			<div className="mb-2 text-sm text-gray-500">
				{records.length} registro(s)
			</div>
			<DataTable
				columns={COLUMNS}
				data={records as DbfRecord[]}
				onRowClick={handleEdit}
				pageSize={50}
				highlightedRow={highlightedRecord}
			/>
			<Modal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				title={editing ? "Editar Cancelamento" : "Novo Cancelamento"}
				size="lg"
				footer={
					<>
						<Btn
							variant="secondary"
							onClick={() => setModalOpen(false)}
						>
							Cancelar
						</Btn>
						<Btn
							onClick={handleSave}
							disabled={saving || !isDirty} // Botão desabilita se não estiver "sujo"
						>
							{saving ? "Salvando..." : "Salvar"}
						</Btn>
						{/* O botão abaixo estava causando o erro por estar dentro de um objeto literal */}

						{/*editing && (
							<Btn
								variant="danger"
								onClick={() => {
									setModalOpen(false);
									handleDeleteRequest(editing);
								}}
							>
								Excluir
							</Btn>
						)*/}
					</>
				}
			>
				<FormSection title="Identificação">
					<FormRow cols={3}>
						<FormInput
							label="Nº Cancelamento"
							value={form.cnumero}
							onChange={(e) => set("cnumero", e.target.value)}
							maxLength={9}
							required
						/>
						<FormInput
							label="Filial"
							value={form.filial}
							onChange={(e) => set("filial", e.target.value)}
							maxLength={2}
						/>
						<FormInput
							label="Código Contrato"
							value={form.ccodigo}
							onChange={(e) => set("ccodigo", e.target.value)}
							maxLength={9}
							required
						/>
					</FormRow>
					<FormRow cols={2}>
						<FormInput
							label="Grupo"
							value={form.cgrupo}
							onChange={(e) => set("cgrupo", e.target.value)}
							maxLength={2}
						/>
						<FormInput
							label="Por"
							value={form.por}
							onChange={(e) => set("por", e.target.value)}
							maxLength={10}
						/>
					</FormRow>
				</FormSection>
				<FormSection title="Detalhes">
					<FormInput
						label="Motivo"
						value={form.cmotivo}
						onChange={(e) => set("cmotivo", e.target.value)}
						maxLength={20}
					/>
					<FormRow cols={2}>
						<FormInput
							label="Dt. Lançamento"
							type="date"
							// USA A FUNÇÃO IMPORTADA AQUI:
							value={toDateInputValue(form.lancto_)}
							onChange={(e) =>
								set(
									"lancto_",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
						/>
						<FormInput
							label="Dt. Processo"
							type="date"
							// E AQUI TAMBÉM:
							value={toDateInputValue(form.procto_)}
							onChange={(e) =>
								set(
									"procto_",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
						/>
					</FormRow>
				</FormSection>
			</Modal>

			<ConfirmDialog
				isOpen={!!confirmDelete}
				onConfirm={handleDelete}
				onCancel={() => setConfirmDelete(null)}
				title="Confirmar Exclusão"
				message={`Deseja excluir o cancelamento nº ${confirmDelete?.cnumero}?`}
			/>
		</div>
	);
}
