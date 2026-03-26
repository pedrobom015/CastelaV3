import { useState, useMemo, useRef, useEffect } from "react";
import { Modal, ConfirmDialog } from "../../../components/common/Modal";
import { DataTable, type Column } from "../../../components/common/DataTable";
import { Btn } from "../../../components/common/PageHeader";
import {
	FormInput,
	FormSelect,
	FormSection,
	FormRow,
} from "../../../components/common/FormField";
import { useAppStore } from "../../../store/appStore";
import { useThemeStore } from "../../../store/themeStore";
import { filterRecords } from "../../../utils/dbfHelpers";
import {
	formatDate,
	formatCpf,
	toDateInputValue,
} from "../../../utils/formatters";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import type { Inscrit } from "../../../types/models";
import { PrintPreviewModal } from "../../../components/common/PrintPreviewModal";
import type { DbfRecord } from "../../../types/models";

/* ── helpers de label ── */
const GRAU_MAP: Record<string, string> = {
	"1": "Cônjuge",
	"2": "Filho(a)",
	"3": "Pai/Mãe",
	"4": "Sogro(a)",
	"5": "Irmão/Irmã",
	"6": "Neto(a)",
	"9": "Outros",
};
function grauLabel(g: string) {
	return GRAU_MAP[g] ?? g;
}

const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; padding: 20px 14mm 20mm; }
  .doc-header { background: #f0f4f8; color: #1a3a5c; padding: 9px 14px; border-radius: 4px;
    margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
  .doc-header h1 { font-size: 13px; font-weight: bold; }
  .doc-header span { font-size: 11px; opacity: .9; }
  .block { border: 1px solid #e0e0e0; border-radius: 3px; margin-bottom: 10px; overflow: hidden; break-inside: avoid; }
  .block-title { background: #f0f4f8; color: #1a3a5c; font-weight: bold; font-size: 10px; padding: 5px 10px; letter-spacing: .5px; }
  .block-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; padding: 8px 10px; }
  .field { display: flex; flex-direction: column; }
  .label { font-size: 9px; color: #999; margin-bottom: 1px; }
  .value { font-size: 11px; font-weight: 600; color: #222; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  thead tr { background: #f0f4f8; }
  th { padding: 5px 7px; text-align: left; font-size: 9px; color: #1a3a5c; font-weight: bold;
    border-bottom: 2px solid #e0e0e0; white-space: nowrap; }
  td { padding: 4px 7px; border-bottom: 1px solid #f0f0f0; }
  tr:nth-child(even) td { background: #fafafa; }
  @media print { body { padding: 12mm 10mm; } .block { break-inside: avoid; } }
`;

function buildPrintTodosHtml(
	inscritos: DbfRecord[],
	codigo: string,
	nomeContrato: string,
): string {
	const rows = inscritos
		.map(
			(r) => `
		<tr>
			<td>${r.seq ?? ""}</td>
			<td>${grauLabel(String(r.grau ?? ""))}</td>
			<td>${r.nome ?? ""}</td>
			<td>${formatDate(r.nascto_ as Date | null)}</td>
			<td>${r.sexo ?? ""}</td>
			<td>${formatDate(r.tcarencia as Date | null)}</td>
			<td>${r.vivofalec ?? ""}</td>
			<td>${formatCpf(String(r.cpf ?? ""))}</td>
			<td>${r.tipo ?? ""}</td>
		</tr>`,
		)
		.join("");

	return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
	<title>Inscritos — Contrato ${codigo}</title>
	<style>${PRINT_STYLES}</style></head><body>
	<div class="doc-header">
		<h1>INSCRITOS — CONTRATO Nº ${String(codigo).padStart(9, "0")}</h1>
		<span>${nomeContrato} &nbsp;|&nbsp; ${inscritos.length} inscrito(s)</span>
	</div>
	<table>
		<thead><tr>
			<th>Seq</th><th>Grau</th><th>Nome</th><th>Nascimento</th>
			<th>Sexo</th><th>Carência</th><th>V/F</th><th>CPF</th><th>Tipo</th>
		</tr></thead>
		<tbody>${rows}</tbody>
	</table>
	</body></html>`;
}

function buildPrintFichaHtml(
	ins: Inscrit | DbfRecord,
	codigo: string,
	nomeContrato: string,
): string {
	const r = ins as Record<string, unknown>;
	const field = (label: string, value: string) => `
		<div class="field"><span class="label">${label}</span><span class="value">${value || "—"}</span></div>`;

	const falecBlock =
		r.vivofalec === "F"
			? `
		<div class="block">
			<div class="block-title">FALECIMENTO</div>
			<div class="block-fields">
				${field("Data Falecimento", formatDate(r.falecto_ as Date | null))}
				${field("Nº Processo", String(r.procnr ?? ""))}
			</div>
		</div>`
			: "";

	return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
	<title>Inscrito — ${r.nome}</title>
	<style>${PRINT_STYLES}</style></head><body>
	<div class="doc-header">
		<h1>INSCRITO — CONTRATO Nº ${String(codigo).padStart(9, "0")}</h1>
		<span>${nomeContrato}</span>
	</div>
	<div class="block">
		<div class="block-title">IDENTIFICAÇÃO</div>
		<div class="block-fields">
			${field("Nome", String(r.nome ?? ""))}
			${field("Grau", grauLabel(String(r.grau ?? "")))}
			${field("Seq", String(r.seq ?? ""))}
			${field("Sexo", r.sexo === "M" ? "Masculino" : r.sexo === "F" ? "Feminino" : String(r.sexo ?? ""))}
			${field("CPF", formatCpf(String(r.cpf ?? "")))}
			${field("Tipo", String(r.tipo ?? ""))}
		</div>
	</div>
	<div class="block">
		<div class="block-title">PLANO</div>
		<div class="block-fields">
			${field("Nascimento", formatDate(r.nascto_ as Date | null))}
			${field("Carência até", formatDate(r.tcarencia as Date | null))}
			${field("Situação", r.vivofalec === "V" ? "Vivo" : r.vivofalec === "F" ? "Falecido" : String(r.vivofalec ?? ""))}
			${field("Lançamento", formatDate(r.lancto_ as Date | null))}
		</div>
	</div>
	${falecBlock}
	</body></html>`;
}

interface Props {
	isOpen: boolean;
	onClose: () => void;
	codigo: string;
	nomeContrato: string;
	hideHeader?: boolean;
}

const SEXO_OPTS = [
	{ value: "", label: "-- --" },
	{ value: "M", label: "Masculino" },
	{ value: "F", label: "Feminino" },
];

const GRAU_OPTS = [
	{ value: "1", label: "1 - Titular" },
	{ value: "2", label: "2 - Cônjuge" },
	{ value: "3", label: "3 - Filho(a)" },
	{ value: "4", label: "4 - Pai/Mãe" },
	{ value: "5", label: "5 - Sogro(a)" },
	{ value: "6", label: "6 - Irmão/Irmã" },
	{ value: "7", label: "7 - Neto(a)" },
	{ value: "8", label: "8 - Outros" },
];

const ESTCIVIL_OPTS = [
	{ value: "", label: "-- --" },
	{ value: "SO", label: "Solteiro(a)" },
	{ value: "CA", label: "Casado(a)" },
	{ value: "DI", label: "Divorciado(a)" },
	{ value: "VI", label: "Viúvo(a)" },
	{ value: "SE", label: "Separado(a)" },
	{ value: "UN", label: "União Estável" },
];


const COLS: Column[] = [
	{ key: "seq", label: "Seq", width: "50px", align: "center" },
	{ key: "grau", label: "Grau", width: "50px", align: "center" },
	{ key: "nome", label: "Nome", width: "200px" },
	{
		key: "nascto_",
		label: "Nascimento",
		width: "100px",
		render: (v) => formatDate(v as Date | null),
	},
	{ key: "sexo", label: "Sexo", width: "60px", align: "center" },
	{
		key: "tcarencia",
		label: "Carência",
		width: "100px",
		render: (v) => formatDate(v as Date | null),
	},
	{ key: "vivofalec", label: "V/F", width: "50px", align: "center" },
	{ key: "cpf", label: "CPF", width: "120px" },
];

function emptyInscrit(codigo: string, seq: number): Inscrit {
	return {
		codigo,
		grau: "2",
		seq,
		ehtitular: "N",
		nome: "",
		nascto_: null,
		estcivil: "",
		interdito: "N",
		sexo: "",
		tcarencia: null,
		lancto_: new Date(),
		vivofalec: "V",
		falecto_: null,
		tipo: "",
		procnr: "",
		por: "",
		flag_excl: "",
		cpf: "",
		segmesref: null,
		segpercen: 0,
		segcodcob: "",
		segservcod: "",
	};
}

/* ── Panel: conteúdo sem wrapper de Modal ── */
export function InscritosPanel({
	codigo,
	nomeContrato,
	hidePrintTodos,
}: {
	codigo: string;
	nomeContrato: string;
	hidePrintTodos?: boolean;
}) {
	const { getTable, setTable, dirHandle, usuario } = useAppStore();
	const _theme = useThemeStore((s) => s.theme);
	const primary =
		_theme === "orange"
			? "#ff914d"
			: _theme === "gray"
				? "#248094"
				: "#1e3a8a";
	const selectedBg =
		_theme === "orange"
			? "#ffedd5"
			: _theme === "gray"
				? "#e0f2fe"
				: "#dbeafe";
	const [selected, setSelected] = useState<DbfRecord | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [mode, setMode] = useState<"include" | "edit" | "view">("view");
	const [form, setForm] = useState<Inscrit>(emptyInscrit(codigo, 1));
	const [confirmDel, setConfirmDel] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const [minHeight, setMinHeight] = useState(0);
	const isDirty =
		mode === "edit" && selected
			? JSON.stringify(form) !== JSON.stringify(selected)
			: true;

	const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(
		null,
	);
	const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(
		null,
	);

	const table = getTable("inscrits");
	const inscritos = useMemo(
		() => filterRecords(table, "codigo", codigo),
		[table, codigo],
	);

	const columns: Column[] = useMemo(
		() => [
			{ key: "seq", label: "Seq", width: "50px", align: "center" },
			{ key: "grau", label: "Grau", width: "50px", align: "center" },
			{ key: "nome", label: "Nome", width: "200px" },
			{
				key: "nascto_",
				label: "Nascimento",
				width: "100px",
				render: (v) => formatDate(v as Date | null),
			},
			{ key: "sexo", label: "Sexo", width: "60px", align: "center" },
			{
				key: "tcarencia",
				label: "Carência",
				width: "100px",
				render: (v) => formatDate(v as Date | null),
			},
			{ key: "vivofalec", label: "V/F", width: "50px", align: "center" },
			{ key: "tipo", label: "Nível", width: "60px", align: "center" },
			{ key: "cpf", label: "CPF", width: "120px" },
			{
				key: "acoes",
				label: "",
				width: "50px",
				align: "center",
				sortable: false,
				render: (_, record) => (
					<button
						onClick={(e) => {
							e.stopPropagation();
							setPrintPreviewHtml(
								buildPrintFichaHtml(
									record as unknown as Inscrit,
									codigo,
									nomeContrato,
								),
							);
						}}
						className="p-1 hover:bg-gray-200 rounded transition-colors text-lg invisible group-hover:visible"
						title="Imprimir Ficha"
					>
						🖨️
					</button>
				),
			},
		],
		[codigo, nomeContrato],
	);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const h = entry.contentRect.height;
			setMinHeight((prev) => (h > prev ? h : prev));
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	function handleNew() {
		const nextSeq = inscritos.length + 1;
		setForm({ ...emptyInscrit(codigo, nextSeq), por: usuario });
		setMode("include");
		setEditOpen(true);
		setSaved(false);
	}

	async function handleSave() {
		if (!dirHandle || !table) return;
		setSaving(true);
		try {
			const recs = [...table.records];
			const savedRec = form as unknown as DbfRecord;
			if (mode === "include") {
				recs.push(savedRec);
			} else {
				const idx = recs.indexOf(selected!);
				if (idx >= 0) recs[idx] = savedRec;
			}
			const newTable = { ...table, records: recs };
			await writeDbfFile(dirHandle, "INSCRITS", newTable);
			setTable("inscrits", newTable);
			setHighlightedRow(savedRec);
			setTimeout(() => setHighlightedRow(null), 3000);
		} catch (e) {
			alert("Erro ao salvar: " + e);
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!dirHandle || !table || !selected) return;
		setSaving(true);
		try {
			const recs = table.records.filter((r) => r !== selected);
			const newTable = { ...table, records: recs };
			await writeDbfFile(dirHandle, "INSCRITS", newTable);
			setTable("inscrits", newTable);
			setSelected(null);
			setConfirmDel(false);
		} catch (e) {
			alert("Erro ao excluir: " + e);
		} finally {
			setSaving(false);
		}
	}

	function setF(field: keyof Inscrit, value: unknown) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	return (
		<>
			<div
				ref={containerRef}
				style={{ minHeight: minHeight || undefined }}
			>
				<div className="flex gap-2 mb-3 justify-end">
					<Btn size="sm" onClick={handleNew} icon="+">
						Novo
					</Btn>
					<Btn
						size="sm"
						variant="secondary"
						onClick={() =>
							setPrintPreviewHtml(
								buildPrintTodosHtml(
									inscritos as DbfRecord[],
									codigo,
									nomeContrato,
								),
							)
						}
						icon="🖨️"
					>
						Imprimir Todos
					</Btn>
				</div>

				<DataTable
					columns={columns}
					data={inscritos as never[]}
					onRowClick={(r) => {
						if (
							selected === r &&
							editOpen &&
							mode === "edit" &&
							highlightedRow !== r
						) {
							setEditOpen(false);
							return;
						}
						setSelected(r);
						setForm(r as unknown as Inscrit);
						setMode("edit");
						setEditOpen(true);
					}}
					selectedRow={selected}
					compact
					highlightedRow={highlightedRow}
					expandedRow={mode === "edit" && editOpen ? selected : null}
					expandedContent={
						mode === "edit" && editOpen ? (
							<div
								key={
									String(selected?.seq) +
									String(selected?.nome)
								}
								className="border-t-2 p-3 expand-down form-compact"
								style={{
									borderColor: primary,
									background: selectedBg,
								}}
							>
								<div className="flex items-center justify-between mb-2">
									<span
										className="text-xs font-semibold uppercase pl-4 tracking-wide"
										style={{ color: primary }}
									>
										{form.nome || "Inscrito"}
									</span>
									<div className="flex items-center gap-2">
										<Btn
											size="sm"
											onClick={handleSave}
											disabled={saving || !isDirty}
										>
											{saving ? "Salvando..." : "Salvar"}
										</Btn>
										<button
											onClick={() => setEditOpen(false)}
											className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1"
										>
											×
										</button>
									</div>
								</div>
								<FormSection title="Dados">
									<FormRow cols={4}>
										<FormSelect
											label="Grau"
											value={form.grau}
											onChange={(e) =>
												setF("grau", e.target.value)
											}
											options={GRAU_OPTS}
										/>
										<FormInput
											label="Seq"
											value={String(form.seq)}
											onChange={(e) =>
												setF(
													"seq",
													parseInt(e.target.value) ||
														0,
												)
											}
											type="number"
										/>
										<FormSelect
											label="Sexo"
											value={form.sexo}
											onChange={(e) =>
												setF("sexo", e.target.value)
											}
											options={SEXO_OPTS}
										/>
										<FormSelect
											label="Est. Civil"
											value={form.estcivil}
											onChange={(e) =>
												setF("estcivil", e.target.value)
											}
											options={ESTCIVIL_OPTS}
										/>
									</FormRow>

									<FormRow cols={2}>
										<FormInput
											label="Nome"
											value={form.nome}
											onChange={(e) =>
												setF(
													"nome",
													e.target.value.toUpperCase(),
												)
											}
											maxLength={35}
											required
										/>
										<FormInput
											label="Nascimento"
											type="date"
											value={
												form.nascto_ &&
												!isNaN(
													new Date(
														form.nascto_,
													).getTime(),
												)
													? new Date(form.nascto_)
															.toISOString()
															.substring(0, 10)
													: ""
											}
											onChange={(e) =>
												setF(
													"nascto_",
													e.target.value
														? new Date(
																e.target.value +
																	"T12:00:00",
															)
														: null,
												)
											}
										/>
									</FormRow>
									<FormRow cols={3}>
										<FormInput
											label="CPF"
											value={form.cpf}
											onChange={(e) =>
												setF(
													"cpf",
													e.target.value.replace(
														/\D/g,
														"",
													),
												)
											}
											maxLength={15}
										/>

										<FormInput
											label="Carência até"
											type="date"
											value={
												form.tcarencia &&
												!isNaN(
													new Date(
														form.tcarencia,
													).getTime(),
												)
													? new Date(form.tcarencia)
															.toISOString()
															.substring(0, 10)
													: ""
											}
											onChange={(e) =>
												setF(
													"tcarencia",
													e.target.value
														? new Date(
																e.target.value +
																	"T12:00:00",
															)
														: null,
												)
											}
										/>
										<FormSelect
											label="Vivo/Falecido"
											value={form.vivofalec}
											onChange={(e) =>
												setF(
													"vivofalec",
													e.target.value,
												)
											}
											options={[
												{ value: "V", label: "Vivo" },
												{
													value: "F",
													label: "Falecido",
												},
											]}
										/>
									</FormRow>
									{form.vivofalec === "F" && (
										<FormRow cols={3}>
											<FormInput
												label="Tipo"
												value={form.tipo}
												onChange={(e) =>
													setF(
														"tipo",
														e.target.value.toUpperCase(),
													)
												}
												maxLength={3}
											/>
											<FormInput
												label="Data Falecimento"
												type="date"
												value={toDateInputValue(
													form.falecto_,
												)}
												onChange={(e) =>
													setF(
														"falecto_",
														e.target.value
															? new Date(
																	e.target
																		.value +
																		"T12:00:00",
																)
															: null,
													)
												}
											/>
											<FormInput
												label="Nº Processo"
												value={form.procnr}
												onChange={(e) =>
													setF(
														"procnr",
														e.target.value,
													)
												}
												maxLength={7}
											/>
										</FormRow>
									)}
								</FormSection>
							</div>
						) : null
					}
				/>
			</div>
			<Modal
				isOpen={editOpen && mode === "include"}
				onClose={() => setEditOpen(false)}
				title="Novo Inscrito"
				hideHeader={true}
				size="lg"
				footer={
					<Btn onClick={handleSave} disabled={saving || !isDirty}>
						{saving ? "Salvando..." : "Salvar"}
					</Btn>
				}
			>
				<FormSection title="Dados">
					<FormRow cols={4}>
						<FormSelect
							label="Grau"
							value={form.grau}
							onChange={(e) => setF("grau", e.target.value)}
							options={GRAU_OPTS}
						/>
						<FormInput
							label="Seq"
							value={String(form.seq)}
							onChange={(e) =>
								setF("seq", parseInt(e.target.value) || 0)
							}
							type="number"
						/>
						<FormSelect
							label="Sexo"
							value={form.sexo}
							onChange={(e) => setF("sexo", e.target.value)}
							options={SEXO_OPTS}
						/>
						<FormSelect
							label="Est. Civil"
							value={form.estcivil}
							onChange={(e) => setF("estcivil", e.target.value)}
							options={ESTCIVIL_OPTS}
						/>
					</FormRow>
					<FormInput
						label="Nome"
						value={form.nome}
						onChange={(e) =>
							setF("nome", e.target.value.toUpperCase())
						}
						maxLength={35}
						required
					/>
					<FormRow cols={2}>
						<FormInput
							label="Nascimento"
							type="date"
							value={
								form.nascto_ &&
								!isNaN(new Date(form.nascto_).getTime())
									? new Date(form.nascto_)
											.toISOString()
											.substring(0, 10)
									: ""
							}
							onChange={(e) =>
								setF(
									"nascto_",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
						/>
						<FormInput
							label="CPF"
							value={form.cpf}
							onChange={(e) =>
								setF("cpf", e.target.value.replace(/\D/g, ""))
							}
							maxLength={15}
						/>
					</FormRow>
					<FormRow cols={2}>
						<FormInput
							label="Carência até"
							type="date"
							value={
								form.tcarencia &&
								!isNaN(new Date(form.tcarencia).getTime())
									? new Date(form.tcarencia)
											.toISOString()
											.substring(0, 10)
									: ""
							}
							onChange={(e) =>
								setF(
									"tcarencia",
									e.target.value
										? new Date(e.target.value + "T12:00:00")
										: null,
								)
							}
						/>
						<FormSelect
							label="Vivo/Falecido"
							value={form.vivofalec}
							onChange={(e) => setF("vivofalec", e.target.value)}
							options={[
								{ value: "V", label: "Vivo" },
								{ value: "F", label: "Falecido" },
							]}
						/>
					</FormRow>
					{form.vivofalec === "F" && (
						<FormRow cols={3}>
							<FormInput
								label="Tipo"
								value={form.tipo}
								onChange={(e) =>
									setF("tipo", e.target.value.toUpperCase())
								}
								maxLength={3}
							/>
							<FormInput
								label="Data Falecimento"
								type="date"
								value={toDateInputValue(form.falecto_)}
								onChange={(e) =>
									setF(
										"falecto_",
										e.target.value
											? new Date(
													e.target.value +
														"T12:00:00",
												)
											: null,
									)
								}
							/>
							<FormInput
								label="Nº Processo"
								value={form.procnr}
								onChange={(e) => setF("procnr", e.target.value)}
								maxLength={7}
							/>
						</FormRow>
					)}
				</FormSection>
			</Modal>

			<ConfirmDialog
				isOpen={confirmDel}
				onConfirm={handleDelete}
				onCancel={() => setConfirmDel(false)}
				message={`Excluir inscrito ${selected?.nome}?`}
			/>
			<PrintPreviewModal
				html={printPreviewHtml}
				onClose={() => setPrintPreviewHtml(null)}
				title="Prévia de Impressão"
			/>
		</>
	);
}

/* ── Modal wrapper (acesso direto pelo PageHeader) ── */
export function InscritosModal({
	isOpen,
	onClose,
	codigo,
	nomeContrato,
	hideHeader,
}: Props) {
	const { getTable } = useAppStore();
	const table = getTable("inscrits");
	const inscritos = useMemo(
		() => filterRecords(table, "codigo", codigo),
		[table, codigo],
	);
	const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(
		null,
	);
	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title={
					<div className="flex flex-col leading-tight">
						<span className="text-[10px] font-normal opacity-70 uppercase tracking-wider">
							Inscritos
						</span>
						<span className="text-sm font-semibold">
							{String(codigo).padStart(9, "0")} — {nomeContrato}
						</span>
					</div>
				}
				size="xl"
				fixedHeight
				hideHeader={false}
				footer={
					<div className="flex gap-2">
						{/* <Btn
							variant="secondary"
							onClick={() =>
								setPrintPreviewHtml(
									buildPrintTodosHtml(
										inscritos as DbfRecord[],
										codigo,
										nomeContrato,
									),
								)
							}
							icon="🖨️"
						>
							Imprimir
						</Btn> */}
						<Btn variant="secondary" onClick={onClose}>
							Fechar
						</Btn>
					</div>
				}
			>
				<InscritosPanel
					codigo={codigo}
					nomeContrato={nomeContrato}
					hidePrintTodos
				/>
			</Modal>
			<PrintPreviewModal
				html={printPreviewHtml}
				onClose={() => setPrintPreviewHtml(null)}
				title="Prévia — Inscritos"
			/>
		</>
	);
}
