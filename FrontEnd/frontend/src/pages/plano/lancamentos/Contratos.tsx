import { useState, useMemo, useRef, useEffect } from "react";
import { useAppStore } from "../../../store/appStore";
import { DataTable, type Column } from "../../../components/common/DataTable";
import { Modal, ConfirmDialog } from "../../../components/common/Modal";
import {
	PageHeader,
	Btn,
	SearchBar,
	StatusBadge,
} from "../../../components/common/PageHeader";
import {
	formatDate,
	formatCpf,
	situacaoLabel,
} from "../../../utils/formatters";
import { FormInput } from "../../../components/common/FormField";

// Config por status: quais mudanças requerem motivo e gravam em tabelas auxiliares
const STATUS_ACTIONS: Record<string, { titulo: string; label: string; placeholder: string; tabelaDestino: string }> = {
	'2': {
		titulo: 'Cancelamento de Contrato',
		label: 'Motivo do cancelamento',
		placeholder: 'Informe o motivo...',
		tabelaDestino: 'cancels',
	},
	// Exemplo para futuro:
	// 'R': { titulo: 'Reintegração', label: 'Motivo da reintegração', placeholder: '...', tabelaDestino: 'cgrupos' },
};
import { getRecords, searchRecords, nextCode } from "../../../utils/dbfHelpers";
import type { Grupo } from "../../../types/models";
import type { DbfRecord } from "../../../types/models";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import { TaxasModal } from "./TaxasModal";
import { InscritosModal } from "./InscritosModal";
import { AdendosModal } from "./AdendosModal";
import { ContratoModal } from "./ContratoModal";
import { PrintModal } from "../../../components/common/PrintModal";
import { PrintPreviewModal } from "../../../components/common/PrintPreviewModal";

function emptyGrupo(): Grupo {
	return {
		codigo: "",
		grupo: "",
		situacao: "1",
		nome: "",
		nascto_: null,
		estcivil: "",
		cpf: "",
		rg: "",
		endereco: "",
		bairro: "",
		cidade: "",
		uf: "",
		cep: "",
		natural: "",
		relig: "",
		contato: "",
		telefone: "",
		tipcont: "",
		vlcarne: "",
		formapgto: "",
		seguro: 0,
		admissao: null,
		tcarencia: null,
		saitxa: "",
		diapgto: "",
		vendedor: "",
		regiao: "",
		cobrador: "",
		obs: "",
		renovar: null,
		funerais: 0,
		circinic: "",
		ultcirc: "",
		qtcircs: 0,
		qtcircpg: 0,
		titular: "",
		particv: 0,
		particf: 0,
		nrdepend: 0,
		ultimp_: null,
		ender_: null,
		ultend: "",
		em_: new Date(),
		por: "",
		atend1: "",
		atend2: "",
		ultnraux: "",
		ultdtaux: null,
		ultvlaux: 0,
		email: "",
		segmesref: null,
		segcodcob: "",
		segservcod: "",
		nrsorteio: "",
		complem: "",
	};
}

const COLUMNS: Column[] = [
	{ key: "codigo", label: "Código", width: "80px" },
	{ key: "grupo", label: "Grupo", width: "60px", align: "center" },
	{ key: "nome", label: "Nome", width: "220px" },
	{
		key: "cpf",
		label: "CPF",
		width: "120px",
		render: (v) => formatCpf(String(v ?? "")),
	},
	{
		key: "situacao",
		label: "Situação",
		width: "100px",
		render: (v) => <StatusBadge status={String(v ?? "")} />,
	},
	{
		key: "admissao",
		label: "Admissão",
		width: "100px",
		render: (v) => formatDate(v as Date | null),
	},
	{
		key: "ultdtaux",
		label: "Últ. Alteração",
		width: "140px",
		render: (v) =>
			v
				? new Date(v as string).toLocaleString("pt-BR", {
						dateStyle: "short",
						timeStyle: "short",
					})
				: "—",
	},
];

export function ContratosPage() {
	const { getTable, dirHandle, setTable, usuario } = useAppStore();
	useAppStore((s) => s.tables);
	const [search, setSearch] = useState("");
	const [selectedRecord, setSelectedRecord] = useState<DbfRecord | null>(
		null,
	);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"include" | "edit" | "view">(
		"view",
	);
	const [formData, setFormData] = useState<Grupo>(emptyGrupo());
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [taxasTarget, setTaxasTarget] = useState<{
		codigo: string;
		nome: string;
	} | null>(null);
	const [inscritosTarget, setInscritosTarget] = useState<{
		codigo: string;
		nome: string;
		fromModal?: boolean;
	} | null>(null);
	const [adendosTarget, setAdendosTarget] = useState<{
		codigo: string;
		nome: string;
	} | null>(null);
	const [printData, setPrintData] = useState<Grupo | null>(null);
	const [printTableHtml, setPrintTableHtml] = useState<string | null>(null);
	const [highlightedRecord, setHighlightedRecord] =
		useState<DbfRecord | null>(null);
	const [saving, setSaving] = useState(false);
	const [pendingSave, setPendingSave] = useState<Grupo | null>(null);
	const [statusMotivo, setStatusMotivo] = useState('');

	const tableRef = useRef<HTMLDivElement>(null);
	const [autoPageSize, setAutoPageSize] = useState(15);
	useEffect(() => {
		const ROW_H = 37;
		const OVERHEAD = 90;
		const calc = () => {
			if (!tableRef.current) return;
			const top = tableRef.current.getBoundingClientRect().top;
			const available = window.innerHeight - top - OVERHEAD;
			setAutoPageSize(Math.max(5, Math.floor(available / ROW_H)));
		};
		calc();
		window.addEventListener("resize", calc);
		const ro = new ResizeObserver(calc);
		if (tableRef.current) ro.observe(tableRef.current);
		return () => {
			window.removeEventListener("resize", calc);
			ro.disconnect();
		};
	}, []);

	const table = getTable("grupos");

	const records = useMemo(() => {
		const all = getRecords(table);
		return searchRecords(
			{ records: all, header: table?.header } as never,
			search,
			["codigo", "nome", "cpf", "telefone", "cobrador"],
		);
	}, [table, search]);

	function handleNew() {
		const newCode = nextCode(table, "codigo", 6);
		setFormData({
			...emptyGrupo(),
			codigo: newCode,
			admissao: new Date(),
			em_: new Date(),
			por: usuario,
		});
		setModalMode("include");
		setModalOpen(true);
	}

	function handleEdit(record: DbfRecord | null = selectedRecord) {
		if (!record) return;
		setSelectedRecord(record);
		setFormData(record as unknown as Grupo);
		setModalMode("edit");
		setModalOpen(true);
	}

	async function handleSave(data: Grupo, adesaoNrParc?: number, adesaoDataInicio?: Date | null): Promise<Grupo | null> {
		const oldSit = String(selectedRecord?.situacao ?? '').trim();
		const newSit = String(data.situacao ?? '').trim();
		if (modalMode === 'edit' && oldSit !== newSit && STATUS_ACTIONS[newSit]) {
			setPendingSave(data);
			setStatusMotivo('');
			return null;
		}
		return executeSave(data, null, adesaoNrParc, adesaoDataInicio);
	}

	async function executeSave(data: Grupo, motivo: string | null, adesaoNrParc?: number, adesaoDataInicio?: Date | null): Promise<Grupo | null> {
		if (!dirHandle || !table) return null;
		setSaving(true);
		try {
			// Seta a data de última alteração
			data.ultdtaux = new Date();

			const records = [...table.records];
			if (modalMode === "include") {
				records.push(data as unknown as DbfRecord);
			} else {
				const idx = records.findIndex((r) => r.codigo === data.codigo);
				if (idx >= 0) records[idx] = data as unknown as DbfRecord;
			}
			const newTable = { ...table, records };
			await writeDbfFile(dirHandle, "GRUPOS", newTable);
			setTable("grupos", newTable);
			setFormData(data); // Sincroniza dados para resetar isDirty na modal

			// Grava em tabela auxiliar se mudou de situação (ex: cancelamento)
			if (motivo !== null) {
				const oldSit = String(selectedRecord?.situacao ?? '').trim();
				const newSit = String(data.situacao ?? '').trim();
				if (oldSit !== newSit && newSit === '2') {
					const cancelsTable = getTable('cancels');
					if (cancelsTable) {
						const newCancel: DbfRecord = {
							cnumero: nextCode(cancelsTable, 'cnumero', 6),
							filial: '01',
							ccodigo: data.codigo,
							cgrupo: data.grupo,
							cmotivo: motivo.slice(0, 20),
							lancto_: new Date(),
							por: usuario,
							procto_: null,
						};
						const newCancelsTable = { ...cancelsTable, records: [...cancelsTable.records, newCancel] };
						await writeDbfFile(dirHandle, 'CANCELS', newCancelsTable);
						setTable('cancels', newCancelsTable);
					}
				}
			}

			// Ao incluir novo contrato, cria o inscrito titular automaticamente
			if (modalMode === "include") {
				const inscritsTable = getTable("inscrits");
				if (inscritsTable) {
					const titularInscrit: DbfRecord = {
						codigo: data.codigo,
						seq: 1,
						grau: "1",
						ehtitular: "S",
						nome: data.nome,
						nascto_: data.nascto_,
						cpf: data.cpf,
						estcivil: data.estcivil,
						sexo: "",
						interdito: "N",
						tcarencia: data.tcarencia,
						lancto_: new Date(),
						vivofalec: "V",
						falecto_: null,
						tipo: "",
						procnr: "",
						por: data.por,
						flag_excl: "",
						segmesref: null,
						segpercen: 0,
						segcodcob: "",
						segservcod: "",
					};
					const newInscritsTable = {
						...inscritsTable,
						records: [...inscritsTable.records, titularInscrit],
					};
					await writeDbfFile(dirHandle, "INSCRITS", newInscritsTable);
					setTable("inscrits", newInscritsTable);
				}
			}

			// Gera taxas tipo 1 (adesão parcelada) ao incluir novo contrato
			if (modalMode === 'include' && adesaoNrParc && adesaoNrParc > 0) {
				const classesTable = getTable('classes');
				const tipcont = String(data.tipcont ?? '').trim();
				const classesRec = tipcont && classesTable
					? classesTable.records.find((r) => !r._deleted && String(r.classcod ?? '').trim() === tipcont)
					: undefined;
				const vljoia = Number(classesRec?.vljoia ?? 0);
				if (vljoia > 0) {
					const taxasTable = getTable('taxas');
					if (taxasTable) {
						const vlParcela = Math.floor((vljoia / adesaoNrParc) * 100) / 100;
						// Primeiro vencimento: usa dataInicio fornecida ou calcula a partir de diapgto
						const today = new Date();
						let baseDia: number;
						let baseMes: number;
						let baseAno: number;
						if (adesaoDataInicio) {
							baseDia = adesaoDataInicio.getDate();
							baseMes = adesaoDataInicio.getMonth();
							baseAno = adesaoDataInicio.getFullYear();
						} else {
							baseDia = Math.max(1, Math.min(31, parseInt(String(data.diapgto ?? '').trim()) || 1));
							baseMes = today.getMonth();
							baseAno = today.getFullYear();
							if (baseDia <= today.getDate()) {
								baseMes += 1;
								if (baseMes > 11) { baseMes = 0; baseAno += 1; }
							}
						}
						const novasTaxas: DbfRecord[] = Array.from({ length: adesaoNrParc }, (_, i) => {
							const mes = baseMes + i;
							const ano = baseAno + Math.floor(mes / 12);
							const mo = mes % 12;
							const ultimoDia = new Date(ano, mo + 1, 0).getDate();
							return {
							codigo: data.codigo,
							tipo: '1',
							circ: String(i + 1).padStart(3, '0'),
							emissao_: new Date(ano, mo, Math.min(baseDia, ultimoDia)),
							valor: vlParcela,
							pgto_: null,
							valorpg: 0,
							cobrador: String(data.cobrador ?? ''),
							forma: '',
							baixa_: null,
							por: usuario,
							stat: 'A',
							filial: '01',
							flag_excl: '',
							cedente: '',
							nnumero: '',
							codlan: '',
						};});
						const newTaxasTable = { ...taxasTable, records: [...taxasTable.records, ...novasTaxas] };
						await writeDbfFile(dirHandle, 'TAXAS', newTaxasTable);
						setTable('taxas', newTaxasTable);
					}
				}
			}

			// Gera taxa tipo 2 (mensalidade base da categoria) ao incluir novo contrato
		if (modalMode === 'include') {
			const classesTableMensal = getTable('classes');
			const tipcont = String(data.tipcont ?? '').trim();
			const classesRecMensal = tipcont && classesTableMensal
				? classesTableMensal.records.find((r) => !r._deleted && String(r.classcod ?? '').trim() === tipcont)
				: undefined;
			const vlmensal = Number(classesRecMensal?.vlmensal ?? 0);
			if (vlmensal > 0) {
				const taxasTableMensal = getTable('taxas');
				if (taxasTableMensal) {
					const today = new Date();
					const diapgto = Math.max(1, Math.min(31, parseInt(String(data.diapgto ?? '').trim()) || 1));
					let baseMes = today.getMonth();
					let baseAno = today.getFullYear();
					if (diapgto <= today.getDate()) {
						baseMes += 1;
						if (baseMes > 11) { baseMes = 0; baseAno += 1; }
					}
					const ultimoDiaMensal = new Date(baseAno, baseMes + 1, 0).getDate();
					const emissaoMensal = new Date(baseAno, baseMes, Math.min(diapgto, ultimoDiaMensal));
					const taxaMensalidadeBase: DbfRecord = {
						codigo: data.codigo,
						tipo: '2',
						circ: '001',
						emissao_: emissaoMensal,
						valor: vlmensal,
						pgto_: null,
						valorpg: 0,
						cobrador: String(data.cobrador ?? ''),
						forma: '',
						baixa_: null,
						por: usuario,
						stat: 'A',
						filial: '01',
						flag_excl: '',
						cedente: '',
						nnumero: '',
						codlan: '',
					};
					const newTaxasTableMensal = { ...taxasTableMensal, records: [...taxasTableMensal.records, taxaMensalidadeBase] };
					await writeDbfFile(dirHandle, 'TAXAS', newTaxasTableMensal);
					setTable('taxas', newTaxasTableMensal);
				}
			}
		}

		// Gera um atendimento para registrar a modificação
			const atendTable = getTable("atend800");
			if (atendTable) {
				const nextAtendNum = nextCode(atendTable, "numero", 8);
				const agora = new Date();
				const newAtendimento: DbfRecord = {
					numero: nextAtendNum,
					data_: agora,
					hora: agora.toTimeString().slice(0, 5),
					codigo: data.codigo,
					nome: data.nome,
					obs: "CONTRATO MODIFICADO",
					tipo: "Alteração",
					stat: "A",
					por: usuario,
					filial: "01",
				};
				const newAtendTable = {
					...atendTable,
					records: [...atendTable.records, newAtendimento],
				};
				await writeDbfFile(dirHandle, "ATEND800", newAtendTable);
				setTable("atend800", newAtendTable);
			}

			const savedRec =
				newTable.records.find((r) => r.codigo === data.codigo) ?? null;
			setHighlightedRecord(savedRec);
			setTimeout(() => setHighlightedRecord(null), 3000);
			return savedRec as Grupo | null;
		} catch (e) {
			alert("Erro ao salvar: " + String(e));
			return null;
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!dirHandle || !table || !selectedRecord) return;
		setSaving(true);
		try {
			const records = table.records.filter((r) => r !== selectedRecord);
			const newTable = { ...table, records };
			await writeDbfFile(dirHandle, "GRUPOS", newTable);
			setTable("grupos", newTable);
			setSelectedRecord(null);
			setConfirmDelete(false);
		} catch (e) {
			alert("Erro ao excluir: " + String(e));
		} finally {
			setSaving(false);
		}
	}

	function handlePrintTable() {
		const rows = records
			.map(
				(r) => `
			<tr>
				<td>${r.codigo ?? ""}</td>
				<td>${r.grupo ?? ""}</td>
				<td>${r.nome ?? ""}</td>
				<td>${formatCpf(String(r.cpf ?? ""))}</td>
				<td>${r.cobrador ?? ""}</td>
				<td>${r.ultcirc ?? ""}</td>
				<td>${situacaoLabel(String(r.situacao ?? ""))}</td>
				<td>${formatDate(r.admissao as Date | null)}</td>
			</tr>`,
			)
			.join("");

		const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Contratos</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; padding: 20px 14mm 20mm; }
    .doc-header { background: #f0f4f8; color: #1a3a5c; padding: 9px 14px; border-radius: 4px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
    .doc-header h1 { font-size: 13px; font-weight: bold; }
    .doc-header span { font-size: 11px; opacity: .9; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    thead tr { background: #f0f4f8; }
    th { padding: 5px 7px; text-align: left; font-size: 9px; color: #1a3a5c; font-weight: bold; border-bottom: 2px solid #e0e0e0; white-space: nowrap; }
    td { padding: 4px 7px; border-bottom: 1px solid #f0f0f0; }
    tr:nth-child(even) td { background: #fafafa; }
    @media print { body { padding: 12mm 10mm; } }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>CONTRATOS</h1>
    <span>${records.length} registro(s)${search ? " — filtro: " + search : ""}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Código</th><th>Grupo</th><th>Nome</th><th>CPF</th>
        <th>Cobrador</th><th>Últ.Circ</th><th>Situação</th><th>Admissão</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

		setPrintTableHtml(html);
	}

	return (
		<div>
			<PageHeader
				title="Contratos"
				subtitle={`${records.length} contrato(s) ${
					search ? "encontrado(s)" : "cadastrado(s)"
				}`}
				actions={
					<>
						<SearchBar
							value={search}
							onChange={setSearch}
							placeholder="Código, nome, CPF..."
						/>
						<Btn onClick={handleNew} icon="+">
							Novo
						</Btn>
						<Btn
							variant="secondary"
							onClick={() => handleEdit()}
							disabled={!selectedRecord}
							icon="✏️"
						>
							Editar
						</Btn>
						<Btn
							variant="secondary"
							onClick={() =>
								selectedRecord &&
								setTaxasTarget({
									codigo: String(selectedRecord.codigo ?? ""),
									nome: String(selectedRecord.nome ?? ""),
								})
							}
							disabled={!selectedRecord}
							icon="💰"
						>
							Taxas
						</Btn>
						<Btn
							variant="secondary"
							onClick={() =>
								selectedRecord &&
								setInscritosTarget({
									codigo: String(selectedRecord.codigo ?? ""),
									nome: String(selectedRecord.nome ?? ""),
								})
							}
							disabled={!selectedRecord}
							icon="👥"
						>
							Inscritos
						</Btn>
						<Btn
							variant="secondary"
							onClick={handlePrintTable}
							icon="🖨️"
						>
							Imprimir
						</Btn>
					</>
				}
			/>

			<div ref={tableRef}>
				<DataTable
					columns={COLUMNS}
					data={records}
					pageSize={autoPageSize}
					onRowClick={(r) => setSelectedRecord(r)}
					onRowDoubleClick={(r) => handleEdit(r)}
					selectedRow={selectedRecord}
					highlightedRow={highlightedRecord}
				/>
			</div>

			{modalOpen && (
				<ContratoModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					mode={modalMode}
					initialData={formData}
					onSave={handleSave}
					saving={saving}
					onIncludeSaved={(savedData) => {
						setFormData(savedData);
						setModalMode('edit');
					}}
					onAdendos={() =>
						setAdendosTarget({
							codigo: formData.codigo,
							nome: formData.nome,
						})
					}
					onPrint={(data) => setPrintData(data)}
				/>
			)}

			<ConfirmDialog
				isOpen={confirmDelete}
				onConfirm={handleDelete}
				onCancel={() => setConfirmDelete(false)}
				message={`Deseja excluir o contrato ${selectedRecord?.codigo} — ${selectedRecord?.nome}?`}
				title="Confirmar Exclusão"
			/>

			{/* Dialog de motivo para mudança de situação */}
			{pendingSave && STATUS_ACTIONS[String(pendingSave.situacao ?? '').trim()] && (
				<Modal
					isOpen
					onClose={() => setPendingSave(null)}
					title={STATUS_ACTIONS[String(pendingSave.situacao ?? '').trim()].titulo}
					size="sm"
					footer={
						<div className="flex gap-2 justify-end">
							<button
								className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
								onClick={() => setPendingSave(null)}
							>
								Cancelar
							</button>
							<button
								className="px-3 py-1.5 text-sm rounded bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-40"
								disabled={!statusMotivo.trim()}
								onClick={() => {
									const data = pendingSave;
									const mot = statusMotivo;
									setPendingSave(null);
									void executeSave(data, mot);
								}}
							>
								Confirmar
							</button>
						</div>
					}
				>
					<div className="p-1">
						<p className="text-sm text-gray-600 mb-3">
							Contrato <strong>{pendingSave.codigo}</strong> — {pendingSave.nome}
						</p>
						<FormInput
							label={STATUS_ACTIONS[String(pendingSave.situacao ?? '').trim()].label}
							value={statusMotivo}
							onChange={(e) => setStatusMotivo(e.target.value)}
							placeholder={STATUS_ACTIONS[String(pendingSave.situacao ?? '').trim()].placeholder}
							maxLength={20}
							autoFocus
						/>
					</div>
				</Modal>
			)}

			{taxasTarget && (
				<TaxasModal
					isOpen
					onClose={() => setTaxasTarget(null)}
					codigo={taxasTarget.codigo}
					nomeContrato={taxasTarget.nome}
					hideHeader={false}
				/>
			)}

			{inscritosTarget && (
				<InscritosModal
					isOpen
					onClose={() => setInscritosTarget(null)}
					codigo={inscritosTarget.codigo}
					nomeContrato={inscritosTarget.nome}
					hideHeader={inscritosTarget.fromModal}
				/>
			)}

			{adendosTarget && (
				<AdendosModal
					isOpen
					onClose={() => setAdendosTarget(null)}
					codigo={adendosTarget.codigo}
					nomeContrato={adendosTarget.nome}
				/>
			)}

			{printData && (
				<PrintModal
					isOpen
					onClose={() => setPrintData(null)}
					data={printData}
				/>
			)}

			<PrintPreviewModal
				html={printTableHtml}
				onClose={() => setPrintTableHtml(null)}
				title="Prévia — Lista de Contratos"
			/>
		</div>
	);
}
