import { useState, useEffect, useMemo } from "react";
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
import {
	ContratoInput,
	type ContratoResumido,
} from "../../../components/common/ContratoInput";
import {
	FalecidoInput,
	type FalecidoResumido,
} from "../../../components/common/FalecidoInput";
import { formatDate, toDateInputValue } from "../../../utils/formatters";
import { searchRecords, nextCode, findRecord } from "../../../utils/dbfHelpers";
import type { DbfRecord } from "../../../types/models";
import { writeDbfFile } from "../../../services/dbf/DbfReader";

type AflRec = DbfRecord & {
	processo: string;
	proc2: string;
	filial: string;
	ocorr_: Date | null;
	categ: string;
	contrato: string;
	grauparcon: string;
	nomedec: string;
	ruadec: string;
	fonedec: string;
	codigofal: string;
	falecido: string;
	ruares: string;
	baires: string;
	munres: string;
	estres: string;
	nascto_: Date | null;
	falecto_: Date | null;
	horafal: string;
	ruafal: string;
	municfal: string;
	estfal: string;
	sepult_: Date | null;
	horasepult: string;
	cemitsep: string;
	funcresp: string;
	procpagto_: Date | null;
	vlauxilio: number;
	pagtoem_: Date | null;
	intlan: string;
};

function emptyRec(): AflRec {
	return {
		processo: "",
		proc2: "",
		filial: "",
		ocorr_: new Date(),
		categ: "AF",
		contrato: "",
		grauparcon: "",
		nomedec: "",
		ruadec: "",
		fonedec: "",
		codigofal: "",
		falecido: "",
		ruares: "",
		baires: "",
		munres: "",
		estres: "",
		nascto_: null,
		falecto_: null,
		horafal: "",
		ruafal: "",
		municfal: "",
		estfal: "",
		sepult_: null,
		horasepult: "",
		cemitsep: "",
		funcresp: "",
		procpagto_: null,
		vlauxilio: 0,
		pagtoem_: null,
		intlan: "",
	};
}

const COLUMNS: Column[] = [
	{
		key: "processo",
		label: "Processo",
		width: "100px",
		render: (_v, row) =>
			`${String(row.processo ?? "").trim()}/${String(row.proc2 ?? "").trim()}`,
	},
	{ key: "categ", label: "Cat.", width: "50px", align: "center" },
	{ key: "contrato", label: "Contrato", width: "100px" },
	{ key: "falecido", label: "Falecido", width: "220px" },
	{
		key: "falecto_",
		label: "Dt. Falec.",
		width: "100px",
		render: (v) => formatDate(v as Date),
	},
	{ key: "horafal", label: "Hora", width: "60px", align: "center" },
	{ key: "funcresp", label: "Funcionário", width: "80px" },
	{
		key: "vlauxilio",
		label: "Vl. Auxílio",
		width: "110px",
		align: "right",
		render: (v) =>
			v
				? Number(v).toLocaleString("pt-BR", {
						style: "currency",
						currency: "BRL",
					})
				: "",
	},
];

export function AuxilioFuneral() {
	const {
		getTable,
		setTable,
		dirHandle,
		usuario,
		parametros,
		setParametros,
	} = useAppStore();
	const [search, setSearch] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<AflRec | null>(null);
	const [form, setForm] = useState<AflRec>(emptyRec());
	const [confirmDelete, setConfirmDelete] = useState<AflRec | null>(null);
	const [saving, setSaving] = useState(false);
	const [highlightedRecord, setHighlightedRecord] =
		useState<DbfRecord | null>(null);

	// Efeito para garantir que os parâmetros sejam carregados se a store estiver null
	useEffect(() => {
		if (!parametros) {
			const table = getTable("par_adm");
			if (table && table.records.length > 0) {
				// Aqui assumimos que o primeiro registro é o de configuração
				setParametros(table.records[0] as any);
				console.log(
					"✅ Parâmetros carregados manualmente no Auxílio Funeral",
				);
			}
		}
	}, [getTable, parametros, setParametros]);

	const table = getTable("afuner");
	const fncsTable = getTable("fncs");
	const gruposTable = getTable("grupos");

	const isDirty = editing
		? JSON.stringify(form) !== JSON.stringify(editing)
		: form.contrato.trim() !== "" || form.codigofal.trim() !== "";

	const records = useMemo(() => {
		return searchRecords(table, search, [
			"processo",
			"contrato",
			"falecido",
			"nomedec",
			"categ",
		]) as AflRec[];
	}, [table, search]);

	function handleNew() {
		console.log("Parâmetros na Store:", parametros); // <--- Adicione isso
		const filialPadrao = String(parametros?.p_filial ?? "01").trim();
		const rec = emptyRec();
		rec.processo = nextCode(table, "processo", 5);
		rec.intlan = nextCode(table, "intlan", 8);
		rec.proc2 = "01";
		rec.filial = filialPadrao; // <--- Dinâmico agora
		rec.ocorr_ = new Date();
		rec.falecto_ = new Date();
		setEditing(null);
		setForm(rec);
		setModalOpen(true);
	}

	function handleEdit(record: DbfRecord) {
		setEditing(record as AflRec);
		setForm({ ...(record as AflRec) });
		setModalOpen(true);
	}

	function handleDeleteRequest(record: DbfRecord) {
		setConfirmDelete(record as AflRec);
	}

	async function handleDelete() {
		if (!confirmDelete || !table || !dirHandle) return;
		const updated = table.records.filter((r) => r !== confirmDelete);
		const newTable = { ...table, records: updated };
		setTable("afuner", newTable);
		await writeDbfFile(dirHandle, "AFUNER.DBF", newTable);
		setConfirmDelete(null);
	}

	/**
	 * Ao selecionar contrato — preenche dados do declarante:
	 * nome, endereço e telefone do titular do contrato (GRUPOS)
	 */
	function handleSelectContrato(c: ContratoResumido) {
		const grupo = findRecord(gruposTable, "codigo", c.codigo);
		setForm((prev) => ({
			...prev,
			contrato: c.codigo,
			nomedec: String(grupo?.nome ?? c.nome ?? "").trimEnd(),
			ruadec: String(grupo?.endereco ?? "").trimEnd(),
			fonedec: String(grupo?.telefone ?? "").trimEnd(),
			// Limpa o falecido ao trocar contrato
			codigofal: "",
			falecido: "",
			grauparcon: "",
			nascto_: null,
			ruares: "",
			baires: "",
			munres: "",
			estres: "",
		}));
	}

	/**
	 * Ao selecionar inscrito/falecido — preenche dados do falecido:
	 * codigofal (CODIGO+GRAU+SEQ = 12 chars), nome, nascto_, grau e endereço do GRUPOS
	 */
	function handleSelectFalecido(f: FalecidoResumido) {
		// Endereço vem do GRUPOS (inscritos compartilham o endereço do contrato)
		const grupo = findRecord(gruposTable, "codigo", f.codigo);
		setForm((prev) => ({
			...prev,
			codigofal: f.codigofal,
			falecido: f.nome,
			nascto_: f.nascto_ ?? prev.nascto_,
			grauparcon: f.grau || prev.grauparcon,
			ruares: String(grupo?.endereco ?? "").trimEnd() || prev.ruares,
			baires: String(grupo?.bairro ?? "").trimEnd() || prev.baires,
			munres: String(grupo?.cidade ?? "").trimEnd() || prev.munres,
			estres: String(grupo?.uf ?? "").trimEnd() || prev.estres,
		}));
	}

	async function handleSave() {
		if (!dirHandle) return;
		setSaving(true);
		try {
			const currentTable = getTable("afuner");
			const newRec: AflRec = { ...form };

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

			setTable("afuner", newTable);
			await writeDbfFile(dirHandle, "AFUNER.DBF", newTable);

			// --- Dar baixa no inscrito (INSCRITS) ---
			// codigofal = CODIGO(9) + GRAU(1) + SEQ(2) = 12 chars
			if (form.codigofal.trim() && form.falecto_) {
				const currentInscrits = getTable("inscrits");
				if (currentInscrits) {
					const codigoInsc = form.codigofal.substring(0, 9).trimEnd();
					const grauInsc =
						form.codigofal.length > 9 ? form.codigofal[9] : "";
					const seqInsc =
						form.codigofal.length >= 12
							? parseInt(
									form.codigofal.substring(10, 12).trim() ||
										"0",
									10,
								)
							: 0;

					const updatedInscrits = currentInscrits.records.map((r) => {
						const match =
							String(r.codigo ?? "").trim() === codigoInsc &&
							String(r.grau ?? "").trim() === grauInsc &&
							Number(r.seq) === seqInsc;

						if (match) {
							const processoComposto =
								form.processo.trim().padStart(5, "0") +
								form.proc2.trim().padStart(2, "0") +
								form.filial.trim().padStart(2, "0");

							return {
								...r,
								vivofalec: "F",
								falecto_: form.falecto_,
								// Tipo do processo = categoria (AF, etc.)
								tipo: (form.categ || "AFL")
									.substring(0, 3)
									.padEnd(3, " "),
								// Número do processo (PROCNR é C7, processo é C5)
								procnr: processoComposto,
							};
						}
						return r;
					});

					const newInscrits = {
						...currentInscrits,
						records: updatedInscrits,
					};
					setTable("inscrits", newInscrits);
					await writeDbfFile(dirHandle, "INSCRITS.DBF", newInscrits);
				}
			}

			// --- Criar registro em PRCESSOS (apenas em inclusão) ---
			// O PRG só cria o processo se não existir: !PTAB(processo+proc2+filial+categ)
			if (!editing) {
				const currentProc = getTable("prcessos");
				if (currentProc) {
					const chaveProc = (
						form.processo +
						form.proc2 +
						form.filial
					).substring(0, 9);
					const jaExiste = currentProc.records.some(
						(r) =>
							String(r.processo ?? "").trim() ===
								chaveProc.trim() &&
							String(r.categ ?? "").trim() === form.categ.trim(),
					);

					if (!jaExiste) {
						// Busca o grupo para pegar o campo "grupo" (C2)
						const grupoRec = findRecord(
							gruposTable,
							"codigo",
							form.contrato.trim(),
						);
						const codlan = `AFU-${form.intlan}-001`.substring(
							0,
							20,
						);

						const novoProcesso: DbfRecord = {
							processo: chaveProc,
							categ: form.categ,
							saiu: "",
							grup: String(grupoRec?.grupo ?? "").trim(),
							num: form.contrato,
							grau:
								form.codigofal.length > 9
									? form.codigofal[9]
									: "",
							seq:
								form.codigofal.length >= 12
									? parseInt(
											form.codigofal
												.substring(10, 12)
												.trim() || "0",
											10,
										)
									: 0,
							seg: form.nomedec.substring(0, 35),
							ends: form.ruares.substring(0, 40),
							bais: form.baires.substring(0, 25),
							cids: form.munres.substring(0, 25),
							fal: form.falecido.substring(0, 35),
							sep: form.cemitsep.substring(0, 35),
							dfal: form.falecto_,
							codlan,
						};

						const updatedProc = [
							...(currentProc.records ?? []),
							novoProcesso,
						];
						const newProcTable = {
							...currentProc,
							records: updatedProc,
						};
						setTable("prcessos", newProcTable);
						await writeDbfFile(
							dirHandle,
							"PRCESSOS.DBF",
							newProcTable,
						);
					}
				}
			}

			setHighlightedRecord(newRec);
			setTimeout(() => setHighlightedRecord(null), 3000);
			setModalOpen(false);
		} catch (e) {
			alert("Erro ao salvar: " + String(e));
		} finally {
			setSaving(false);
		}
	}

	function set<K extends keyof AflRec>(field: K, value: AflRec[K]) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	const funcionarios = useMemo(() => {
		if (!fncsTable) return [];
		return fncsTable.records
			.filter((r) => !r._deleted)
			.map((r) => ({
				codigo: String(r.codigo ?? "").trim(),
				nome: String(r.nome ?? "").trimEnd(),
			}))
			.sort((a, b) => a.nome.localeCompare(b.nome));
	}, [fncsTable]);

	return (
		<div className="p-4">
			<PageHeader
				title="Auxílio Funeral"
				subtitle="AFUNER.DBF — Lançamento de Auxílio Funeral"
				actions={
					<>
						<SearchBar
							value={search}
							onChange={setSearch}
							placeholder="Buscar por processo, contrato, falecido..."
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
				title={
					editing
						? `Editar Auxílio Funeral — Proc. ${editing.processo}/${editing.proc2}`
						: "Novo Auxílio Funeral"
				}
				size="lg"
				footer={
					<>
						<Btn
							variant="secondary"
							onClick={() => setModalOpen(false)}
						>
							Cancelar
						</Btn>
						{editing && (
							<Btn
								variant="danger"
								onClick={() => {
									setModalOpen(false);
									handleDeleteRequest(editing);
								}}
							>
								Excluir
							</Btn>
						)}
						<Btn onClick={handleSave} disabled={saving || !isDirty}>
							{saving ? "Salvando..." : "Salvar"}
						</Btn>
					</>
				}
			>
				{/* ── Identificação ── */}
				<FormSection title="Identificação">
					<FormRow cols={4}>
						<FormInput
							label="Processo"
							value={form.processo}
							onChange={(e) => set("processo", e.target.value)}
							maxLength={5}
							required
						/>
						<FormInput
							label="Sub"
							value={form.proc2}
							onChange={(e) => set("proc2", e.target.value)}
							maxLength={2}
						/>
						<FormInput
							label="Filial"
							value={form.filial}
							onChange={(e) => set("filial", e.target.value)}
							maxLength={2}
						/>
						<FormInput
							label="Categoria"
							value={form.categ}
							onChange={(e) =>
								set("categ", e.target.value.toUpperCase())
							}
							maxLength={2}
							placeholder="AF"
						/>
					</FormRow>
					<FormInput
						label="Dt. Ocorrência"
						type="date"
						value={toDateInputValue(form.ocorr_)}
						onChange={(e) =>
							set(
								"ocorr_",
								e.target.value
									? new Date(e.target.value + "T12:00:00")
									: null,
							)
						}
					/>
				</FormSection>

				{/* ── Dados do Contratante ── */}
				<FormSection title="Dados do Contratante (Declarante)">
					<FormRow cols={2}>
						<ContratoInput
							value={form.contrato}
							nomeContrato={form.nomedec || undefined}
							label="Contrato"
							required
							onSelect={handleSelectContrato}
						/>
						<FormInput
							label="Grau de Parentesco"
							value={form.grauparcon}
							onChange={(e) => set("grauparcon", e.target.value)}
							maxLength={10}
						/>
					</FormRow>
					<FormInput
						label="Nome do Declarante"
						value={form.nomedec}
						onChange={(e) => set("nomedec", e.target.value)}
						maxLength={35}
					/>
					<FormRow cols={2}>
						<FormInput
							label="Endereço"
							value={form.ruadec}
							onChange={(e) => set("ruadec", e.target.value)}
							maxLength={35}
						/>
						<FormInput
							label="Fone"
							value={form.fonedec}
							onChange={(e) => set("fonedec", e.target.value)}
							maxLength={14}
						/>
					</FormRow>
				</FormSection>

				{/* ── Dados do Falecido ── */}
				<FormSection title="Dados do Falecido">
					<FormRow cols={2}>
						<FalecidoInput
							contrato={form.contrato}
							value={form.codigofal}
							nomeFalecido={form.falecido || undefined}
							label="Código do Falecido"
							required
							onSelect={handleSelectFalecido}
						/>
						<FormInput
							label="Dt. Nascimento"
							type="date"
							value={toDateInputValue(form.nascto_)}
							onChange={(e) =>
								set(
									"nascto_",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
						/>
					</FormRow>
					<FormInput
						label="Nome do Falecido"
						value={form.falecido}
						onChange={(e) => set("falecido", e.target.value)}
						maxLength={35}
						required
					/>
					<FormRow cols={2}>
						<FormInput
							label="Rua"
							value={form.ruares}
							onChange={(e) => set("ruares", e.target.value)}
							maxLength={30}
						/>
						<FormInput
							label="Bairro"
							value={form.baires}
							onChange={(e) => set("baires", e.target.value)}
							maxLength={25}
						/>
					</FormRow>
					<FormRow cols={3}>
						<FormInput
							label="Município"
							value={form.munres}
							onChange={(e) => set("munres", e.target.value)}
							maxLength={25}
						/>
						<FormInput
							label="UF"
							value={form.estres}
							onChange={(e) =>
								set("estres", e.target.value.toUpperCase())
							}
							maxLength={2}
						/>
						<div />
					</FormRow>
				</FormSection>

				{/* ── Dados do Falecimento ── */}
				<FormSection title="Dados do Falecimento">
					<FormRow cols={3}>
						<FormInput
							label="Data do Falecimento"
							type="date"
							value={toDateInputValue(form.falecto_)}
							onChange={(e) =>
								set(
									"falecto_",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
							required
						/>
						<FormInput
							label="Hora"
							value={form.horafal}
							onChange={(e) => set("horafal", e.target.value)}
							maxLength={5}
							placeholder="HH:MM"
						/>
						<div />
					</FormRow>
					<FormRow cols={3}>
						<FormInput
							label="Rua (local)"
							value={form.ruafal}
							onChange={(e) => set("ruafal", e.target.value)}
							maxLength={30}
						/>
						<FormInput
							label="Município"
							value={form.municfal}
							onChange={(e) => set("municfal", e.target.value)}
							maxLength={25}
						/>
						<FormInput
							label="UF"
							value={form.estfal}
							onChange={(e) =>
								set("estfal", e.target.value.toUpperCase())
							}
							maxLength={2}
						/>
					</FormRow>
				</FormSection>

				{/* ── Sepultamento ── */}
				<FormSection title="Sepultamento">
					<FormRow cols={3}>
						<FormInput
							label="Data do Sepultamento"
							type="date"
							value={toDateInputValue(form.sepult_)}
							onChange={(e) =>
								set(
									"sepult_",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
						/>
						<FormInput
							label="Hora"
							value={form.horasepult}
							onChange={(e) => set("horasepult", e.target.value)}
							maxLength={5}
							placeholder="HH:MM"
						/>
						<div />
					</FormRow>
					<FormInput
						label="Cemitério"
						value={form.cemitsep}
						onChange={(e) => set("cemitsep", e.target.value)}
						maxLength={30}
					/>
					<div className="flex flex-col gap-0.5">
						<label className="text-sm font-medium text-gray-700">
							Funcionário Responsável
						</label>
						<select
							value={form.funcresp}
							onChange={(e) => set("funcresp", e.target.value)}
							className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
						>
							<option value="">— Selecione —</option>
							{funcionarios.map((f) => (
								<option key={f.codigo} value={f.codigo}>
									{f.nome}
								</option>
							))}
						</select>
					</div>
				</FormSection>

				{/* ── Pagamento do Auxílio ── */}
				<FormSection title="Pagamento do Auxílio">
					<FormRow cols={3}>
						<FormInput
							label="Proc. Pgto em"
							type="date"
							value={toDateInputValue(form.procpagto_)}
							onChange={(e) =>
								set(
									"procpagto_",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
						/>
						<FormInput
							label="Vl. Auxílio (R$)"
							type="text"
							// Formata o número do estado para Moeda Brasileira ao exibir
							value={new Intl.NumberFormat("pt-BR", {
								style: "currency",
								currency: "BRL",
							}).format(form.vlauxilio || 0)}
							onChange={(e) => {
								// 1. Pega apenas os números digitados (remove R$, pontos e vírgulas)
								const digits = e.target.value.replace(
									/\D/g,
									"",
								);

								// 2. Transforma em centavos (ex: "150" vira 1.50)
								const numericValue = Number(digits) / 100;

								// 3. Salva o número puro no seu estado 'form'
								set("vlauxilio", numericValue);
							}}
						/>

						<FormInput
							label="Pago em"
							type="date"
							value={toDateInputValue(form.pagtoem_)}
							onChange={(e) =>
								set(
									"pagtoem_",
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
				message={`Deseja excluir o processo de auxílio funeral nº ${confirmDelete?.processo}?`}
			/>
		</div>
	);
}
